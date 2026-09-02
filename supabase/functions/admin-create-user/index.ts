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

const roles = [
  "super_admin",
  "admin",
  "aom",
  "supervisor",
  "lead_tech",
  "technician",
] as const;
type UserRole = (typeof roles)[number];

type CreateUserPayload = {
  email?: unknown;
  password?: unknown;
  displayName?: unknown;
  role?: unknown;
  marketId?: unknown;
  reportsToUserId?: unknown;
};

type Profile = {
  user_id: string;
  role: UserRole;
  market_id: number | null;
  reports_to_user_id: string | null;
  is_active: boolean;
};

const allowedRolesFor = (role: UserRole) => {
  if (role === "super_admin") return new Set<UserRole>(roles);
  if (role === "admin")
    return new Set<UserRole>(["aom", "supervisor", "lead_tech", "technician"]);
  if (role === "aom")
    return new Set<UserRole>(["supervisor", "lead_tech", "technician"]);
  if (role === "supervisor")
    return new Set<UserRole>(["lead_tech", "technician"]);
  return new Set<UserRole>();
};

serve(async (request) => {
  if (request.method === "OPTIONS")
    return new Response(null, { headers: corsHeaders });
  if (request.method !== "POST")
    return jsonResponse({ error: "Method not allowed" }, 405);

  const correlationId = crypto.randomUUID();
  let createdUserId: string | null = null;

  try {
    const authorization = request.headers.get("Authorization") ?? "";
    const token = authorization.startsWith("Bearer ")
      ? authorization.slice(7)
      : "";
    if (!token)
      return jsonResponse(
        { error: "Authentication required", correlationId },
        401,
      );

    const service = createClient(
      Deno.env.get("SUPABASE_URL") ?? "",
      Deno.env.get("SUPABASE_SERVICE_ROLE_KEY") ?? "",
      { auth: { autoRefreshToken: false, persistSession: false } },
    );

    const { data: authData, error: authError } =
      await service.auth.getUser(token);
    if (authError || !authData.user) {
      return jsonResponse(
        { error: "Authentication required", correlationId },
        401,
      );
    }

    const { data: caller, error: callerError } = await service
      .from("user_profiles")
      .select("user_id, role, market_id, reports_to_user_id, is_active")
      .eq("user_id", authData.user.id)
      .single<Profile>();
    if (
      callerError ||
      !caller?.is_active ||
      !allowedRolesFor(caller.role).size
    ) {
      return jsonResponse({ error: "Not authorized", correlationId }, 403);
    }

    const payload = (await request.json()) as CreateUserPayload;
    const email =
      typeof payload.email === "string"
        ? payload.email.trim().toLowerCase()
        : "";
    const password =
      typeof payload.password === "string" ? payload.password : "";
    const displayName =
      typeof payload.displayName === "string" ? payload.displayName.trim() : "";
    const role =
      typeof payload.role === "string" &&
      roles.includes(payload.role as UserRole)
        ? (payload.role as UserRole)
        : null;
    const marketId =
      payload.marketId === null ||
      payload.marketId === undefined ||
      payload.marketId === ""
        ? null
        : Number(payload.marketId);
    const reportsToUserId =
      typeof payload.reportsToUserId === "string" && payload.reportsToUserId
        ? payload.reportsToUserId
        : null;

    if (
      !email ||
      !/^\S+@\S+\.\S+$/.test(email) ||
      password.length < 10 ||
      !displayName ||
      displayName.length > 200 ||
      !role ||
      !allowedRolesFor(caller.role).has(role)
    ) {
      return jsonResponse(
        { error: "Invalid user details", correlationId },
        400,
      );
    }
    if (
      (role === "super_admin" || role === "admin") !== (marketId === null) ||
      (marketId !== null && (!Number.isInteger(marketId) || marketId <= 0))
    ) {
      return jsonResponse(
        { error: "Invalid role and market combination", correlationId },
        400,
      );
    }
    if (
      (caller.role === "aom" || caller.role === "supervisor") &&
      marketId !== caller.market_id
    ) {
      return jsonResponse(
        { error: "Not authorized for this market", correlationId },
        403,
      );
    }

    const roleNeedsManager =
      role === "supervisor" || role === "lead_tech" || role === "technician";
    if (roleNeedsManager !== Boolean(reportsToUserId)) {
      return jsonResponse(
        { error: "A valid reporting manager is required", correlationId },
        400,
      );
    }
    if (reportsToUserId) {
      const { data: manager } = await service
        .from("user_profiles")
        .select("user_id, role, market_id, reports_to_user_id, is_active")
        .eq("user_id", reportsToUserId)
        .single<Profile>();
      const allowedManagerRoles =
        role === "supervisor"
          ? ["aom"]
          : role === "lead_tech"
            ? ["supervisor"]
            : ["supervisor", "lead_tech"];
      if (
        !manager?.is_active ||
        manager.market_id !== marketId ||
        !allowedManagerRoles.includes(manager.role)
      ) {
        return jsonResponse(
          { error: "Reporting manager is unavailable", correlationId },
          400,
        );
      }
      if (caller.role === "supervisor") {
        const managerIsCaller = manager.user_id === caller.user_id;
        const managerIsCallersLead =
          manager.role === "lead_tech" &&
          manager.reports_to_user_id === caller.user_id;
        if (
          (role === "lead_tech" && !managerIsCaller) ||
          (role === "technician" && !managerIsCaller && !managerIsCallersLead)
        ) {
          return jsonResponse(
            {
              error: "Reporting manager is outside your hierarchy",
              correlationId,
            },
            403,
          );
        }
      }
    }

    const { data: created, error: createError } =
      await service.auth.admin.createUser({
        email,
        password,
        email_confirm: true,
        user_metadata: { display_name: displayName },
      });
    if (createError || !created.user) throw new Error("AUTH_CREATE_FAILED");
    createdUserId = created.user.id;

    const { error: profileError } = await service.from("user_profiles").insert({
      user_id: createdUserId,
      display_name: displayName,
      email,
      role,
      market_id: marketId,
      reports_to_user_id: reportsToUserId,
      is_active: true,
    });
    if (profileError) throw new Error("PROFILE_CREATE_FAILED");

    const { error: auditError } = await service
      .from("security_audit_log")
      .insert({
        actor_user_id: caller.user_id,
        action: "user_profile.created",
        target_type: "user_profile",
        target_id: createdUserId,
        metadata: { role, market_id: marketId },
      });
    if (auditError) throw new Error("AUDIT_CREATE_FAILED");

    return jsonResponse(
      {
        userId: createdUserId,
        displayName,
        role,
        correlationId,
      },
      201,
    );
  } catch (error) {
    if (createdUserId) {
      try {
        const service = createClient(
          Deno.env.get("SUPABASE_URL") ?? "",
          Deno.env.get("SUPABASE_SERVICE_ROLE_KEY") ?? "",
          { auth: { autoRefreshToken: false, persistSession: false } },
        );
        await service.auth.admin.deleteUser(createdUserId);
      } catch {
        // A correlation ID is logged so operators can reconcile rare compensation failures.
      }
    }
    console.error("admin-create-user failed", {
      correlationId,
      reason: error instanceof Error ? error.message : "UNKNOWN",
      compensationAttempted: Boolean(createdUserId),
    });
    return jsonResponse({ error: "User creation failed", correlationId }, 500);
  }
});
