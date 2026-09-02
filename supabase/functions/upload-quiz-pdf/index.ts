import { serve } from "https://deno.land/std@0.224.0/http/server.ts";
import { createClient } from "https://esm.sh/@supabase/supabase-js@2.114.0";

const allowedOrigin =
  Deno.env.get("APP_ORIGIN") ?? "https://itcservicegroup.github.io";
const corsHeaders = {
  "Access-Control-Allow-Origin": allowedOrigin,
  "Access-Control-Allow-Headers":
    "authorization, x-client-info, apikey, content-type",
  "Access-Control-Allow-Methods": "POST, OPTIONS",
  Vary: "Origin",
};

const jsonResponse = (body: object, status: number) =>
  new Response(JSON.stringify(body), {
    status,
    headers: { ...corsHeaders, "Content-Type": "application/json" },
  });

const sha256Hex = async (value: string) => {
  const digest = await crypto.subtle.digest(
    "SHA-256",
    new TextEncoder().encode(value),
  );
  return Array.from(new Uint8Array(digest), (byte) =>
    byte.toString(16).padStart(2, "0"),
  ).join("");
};

serve(async (request) => {
  if (request.method === "OPTIONS")
    return new Response(null, { headers: corsHeaders });
  if (request.method !== "POST")
    return jsonResponse({ error: "Method not allowed" }, 405);

  try {
    const { pdfData, resultId, uploadToken } = await request.json();
    if (
      !Number.isSafeInteger(resultId) ||
      typeof uploadToken !== "string" ||
      uploadToken.length < 32
    ) {
      return jsonResponse({ error: "Invalid report authorization" }, 400);
    }
    if (
      typeof pdfData !== "string" ||
      !pdfData.startsWith("data:application/pdf;base64,")
    ) {
      return jsonResponse({ error: "A PDF data URL is required" }, 400);
    }

    const encodedPdf = pdfData.slice("data:application/pdf;base64,".length);
    if (encodedPdf.length > 14_000_000) {
      return jsonResponse({ error: "PDF exceeds the 10 MiB limit" }, 413);
    }

    const binary = atob(encodedPdf);
    const pdfBytes = Uint8Array.from(binary, (character) =>
      character.charCodeAt(0),
    );
    if (
      pdfBytes.length > 10 * 1024 * 1024 ||
      pdfBytes.length < 5 ||
      new TextDecoder().decode(pdfBytes.slice(0, 5)) !== "%PDF-"
    ) {
      return jsonResponse({ error: "Invalid PDF content" }, 400);
    }

    const client = createClient(
      Deno.env.get("SUPABASE_URL") ?? "",
      Deno.env.get("SUPABASE_SERVICE_ROLE_KEY") ?? "",
      { auth: { autoRefreshToken: false, persistSession: false } },
    );

    // Claim the one-time token before uploading. The status transition and hash
    // clear make concurrent replays fail instead of creating orphaned reports.
    const tokenHash = `\\x${await sha256Hex(uploadToken)}`;
    const { data: claimedReport, error: claimError } = await client
      .from("quiz_result_reports")
      .update({
        status: "uploading",
        upload_token_hash: null,
        upload_token_expires_at: null,
        updated_at: new Date().toISOString(),
      })
      .eq("result_id", resultId)
      .eq("upload_token_hash", tokenHash)
      .eq("status", "pending")
      .gt("upload_token_expires_at", new Date().toISOString())
      .select("result_id")
      .single();

    if (claimError || !claimedReport) {
      return jsonResponse(
        { error: "Report authorization is invalid or expired" },
        403,
      );
    }

    const objectKey = `${resultId}/${crypto.randomUUID()}.pdf`;
    const { error: uploadError } = await client.storage
      .from("quiz-pdfs")
      .upload(objectKey, pdfBytes, {
        contentType: "application/pdf",
        upsert: false,
      });

    if (uploadError) {
      await client
        .from("quiz_result_reports")
        .update({
          status: "failed",
          error_message: "Storage upload failed",
          updated_at: new Date().toISOString(),
        })
        .eq("result_id", resultId)
        .eq("status", "uploading");
      throw uploadError;
    }

    const { data: finalized, error: finalizeError } = await client.rpc(
      "finalize_quiz_report_upload",
      { p_result_id: resultId, p_object_key: objectKey },
    );

    if (finalizeError || finalized !== true) {
      await client.storage.from("quiz-pdfs").remove([objectKey]);
      await client
        .from("quiz_result_reports")
        .update({
          status: "failed",
          error_message: "Report finalization failed",
          updated_at: new Date().toISOString(),
        })
        .eq("result_id", resultId)
        .eq("status", "uploading");
      throw finalizeError ?? new Error("REPORT_FINALIZATION_FAILED");
    }

    return jsonResponse({ result_id: resultId, report_status: "ready" }, 200);
  } catch (error) {
    console.error(
      "Private quiz report upload failed:",
      error instanceof Error ? error.message : error,
    );
    return jsonResponse({ error: "Report upload failed" }, 500);
  }
});
