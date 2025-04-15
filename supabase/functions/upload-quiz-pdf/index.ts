import { serve } from 'https://deno.land/std@0.177.0/http/server.ts';
import { createClient } from 'https://esm.sh/@supabase/supabase-js@2';
import { corsHeaders } from '../_shared/cors.ts'; // Assuming you have shared CORS headers

// Helper to decode base64
function base64ToArrayBuffer(base64: string): ArrayBuffer {
  const binaryString = atob(base64);
  const len = binaryString.length;
  const bytes = new Uint8Array(len);
  for (let i = 0; i < len; i++) {
    bytes[i] = binaryString.charCodeAt(i);
  }
  return bytes.buffer;
}

serve(async (req: Request) => {
  // Handle CORS preflight requests
  if (req.method === 'OPTIONS') {
    return new Response('ok', { headers: corsHeaders });
  }

  try {
    // --- Get Environment Variables ---
    const supabaseUrl = Deno.env.get('SUPABASE_URL');
    const serviceRoleKey = Deno.env.get('SUPABASE_SERVICE_ROLE_KEY');

    if (!supabaseUrl || !serviceRoleKey) {
      console.error('Missing Supabase environment variables');
      return new Response(JSON.stringify({ error: 'Internal server configuration error.' }), {
        status: 500,
        headers: { ...corsHeaders, 'Content-Type': 'application/json' },
      });
    }

    // --- Initialize Supabase Admin Client ---
    const supabaseAdmin = createClient(supabaseUrl, serviceRoleKey, {
      auth: {
        // Required for admin client
        autoRefreshToken: false,
        persistSession: false,
      },
    });

    // --- Parse Request Body ---
    let pdfData: string;
    let accessCode: string;
    let ldap: string;
    let quizId: string;

    try {
      const body = await req.json();
      pdfData = body.pdfData; // Expecting base64 string
      accessCode = body.accessCode;
      ldap = body.ldap;
      quizId = body.quizId;

      if (!pdfData || !accessCode || !ldap || !quizId) {
        throw new Error('Missing required fields in request body.');
      }
    } catch (e) {
      console.error('Bad request body:', e.message);
      return new Response(JSON.stringify({ error: `Bad Request: ${e.message}` }), {
        status: 400,
        headers: { ...corsHeaders, 'Content-Type': 'application/json' },
      });
    }

    // --- Validate Access Code ---
    console.log(`Validating access code: ${accessCode} for LDAP: ${ldap}, Quiz: ${quizId}`);
    const { data: codeData, error: codeError } = await supabaseAdmin
      .from('v2_access_codes')
      .select('id, is_used, expires_at, ldap, quiz_id')
      .eq('code', accessCode)
      .single();

    if (codeError || !codeData) {
      console.error('Access code validation error or not found:', codeError?.message);
      return new Response(JSON.stringify({ error: 'Invalid or expired access code.' }), {
        status: 403, // Forbidden
        headers: { ...corsHeaders, 'Content-Type': 'application/json' },
      });
    }

    // Check if used
    if (codeData.is_used) {
      console.warn(`Access code ${accessCode} already used.`);
      return new Response(JSON.stringify({ error: 'Access code has already been used.' }), {
        status: 403,
        headers: { ...corsHeaders, 'Content-Type': 'application/json' },
      });
    }

    // Check expiration
    if (codeData.expires_at && new Date(codeData.expires_at) < new Date()) {
       console.warn(`Access code ${accessCode} expired.`);
       return new Response(JSON.stringify({ error: 'Access code has expired.' }), {
         status: 403,
         headers: { ...corsHeaders, 'Content-Type': 'application/json' },
       });
    }

    // Optional: Strict check if code details match provided details
    if (codeData.ldap !== ldap || codeData.quiz_id !== quizId) {
       console.warn(`Access code ${accessCode} details mismatch. DB: (ldap: ${codeData.ldap}, quiz: ${codeData.quiz_id}), Req: (ldap: ${ldap}, quiz: ${quizId})`);
       // Decide if this should be a hard failure or just a warning
       // For now, let's treat it as a failure for security
       return new Response(JSON.stringify({ error: 'Access code details do not match request.' }), {
         status: 403,
         headers: { ...corsHeaders, 'Content-Type': 'application/json' },
       });
    }

    console.log(`Access code ${accessCode} validated successfully.`);

    // --- Decode PDF and Prepare for Upload ---
    const pdfBuffer = base64ToArrayBuffer(pdfData);
    const cleanLDAP = ldap.replace(/[^a-z0-9]/gi, '').toLowerCase();
    const timestamp = new Date().toISOString().replace(/[:.]/g, '-');
    const filename = `${cleanLDAP}-${timestamp}.pdf`;
    const bucketName = 'quiz-pdfs';

    // --- Upload to Storage ---
    console.log(`Uploading ${filename} to bucket ${bucketName}...`);
    const { data: uploadData, error: uploadError } = await supabaseAdmin
      .storage
      .from(bucketName)
      .upload(filename, pdfBuffer, {
        contentType: 'application/pdf',
        upsert: false, // Prevent accidental overwrites
      });

    if (uploadError) {
      console.error('Storage upload error:', uploadError);
      throw new Error(`Failed to upload PDF: ${uploadError.message}`); // Throw to catch block
    }

    console.log('Upload successful:', uploadData);

    // --- Get Public URL ---
    // IMPORTANT: This assumes the bucket allows public access via URL.
    // If the bucket is private, you need a different strategy (e.g., signed URLs generated on demand when viewing results).
    const { data: urlData } = supabaseAdmin.storage.from(bucketName).getPublicUrl(uploadData.path);
    const pdfUrl = urlData?.publicUrl;

    if (!pdfUrl) {
        console.warn(`Could not get public URL for ${uploadData.path}. Returning path instead.`);
    }

    // --- Return Success Response ---
    return new Response(JSON.stringify({ pdf_url: pdfUrl || uploadData.path }), { // Return URL or path
      status: 200,
      headers: { ...corsHeaders, 'Content-Type': 'application/json' },
    });

  } catch (error) {
    console.error('Edge function error:', error);
    return new Response(JSON.stringify({ error: error.message || 'An unexpected error occurred.' }), {
      status: 500,
      headers: { ...corsHeaders, 'Content-Type': 'application/json' },
    });
  }
});
