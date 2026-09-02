--
-- PostgreSQL database dump
--

-- \restrict tkbMuKWbr7b26PpTD55uzeIjP0DEyyu7XENbMo85nAg9fGMEOmphTv7J8LipiQW

-- Dumped from database version 15.14
-- Dumped by pg_dump version 15.14

SET statement_timeout = 0;
SET lock_timeout = 0;
SET idle_in_transaction_session_timeout = 0;
SET client_encoding = 'UTF8';
SET standard_conforming_strings = on;
SELECT pg_catalog.set_config('search_path', '', false);
SET check_function_bodies = false;
SET xmloption = content;
SET client_min_messages = warning;
SET row_security = off;

--
-- Name: pgsodium; Type: EXTENSION; Schema: -; Owner: -
--

CREATE EXTENSION IF NOT EXISTS "pgsodium";


--
-- Name: EXTENSION "pgsodium"; Type: COMMENT; Schema: -; Owner:
--

-- COMMENT ON EXTENSION "pgsodium" IS 'Pgsodium is a modern cryptography library for Postgres.';


--
-- Name: SCHEMA "public"; Type: COMMENT; Schema: -; Owner: pg_database_owner
--

COMMENT ON SCHEMA "public" IS 'standard public schema';


--
-- Name: hypopg; Type: EXTENSION; Schema: -; Owner: -
--

CREATE EXTENSION IF NOT EXISTS "hypopg" WITH SCHEMA "extensions";


--
-- Name: EXTENSION "hypopg"; Type: COMMENT; Schema: -; Owner:
--

-- COMMENT ON EXTENSION "hypopg" IS 'Hypothetical indexes for PostgreSQL';


--
-- Name: index_advisor; Type: EXTENSION; Schema: -; Owner: -
--

CREATE EXTENSION IF NOT EXISTS "index_advisor" WITH SCHEMA "extensions";


--
-- Name: EXTENSION "index_advisor"; Type: COMMENT; Schema: -; Owner:
--

-- COMMENT ON EXTENSION "index_advisor" IS 'Query index advisor';


--
-- Name: pg_stat_statements; Type: EXTENSION; Schema: -; Owner: -
--

CREATE EXTENSION IF NOT EXISTS "pg_stat_statements" WITH SCHEMA "extensions";


--
-- Name: EXTENSION "pg_stat_statements"; Type: COMMENT; Schema: -; Owner:
--

-- COMMENT ON EXTENSION "pg_stat_statements" IS 'track planning and execution statistics of all SQL statements executed';


--
-- Name: pgcrypto; Type: EXTENSION; Schema: -; Owner: -
--

CREATE EXTENSION IF NOT EXISTS "pgcrypto" WITH SCHEMA "extensions";


--
-- Name: EXTENSION "pgcrypto"; Type: COMMENT; Schema: -; Owner:
--

-- COMMENT ON EXTENSION "pgcrypto" IS 'cryptographic functions';


--
-- Name: pgjwt; Type: EXTENSION; Schema: -; Owner: -
--

CREATE EXTENSION IF NOT EXISTS "pgjwt" WITH SCHEMA "extensions";


--
-- Name: EXTENSION "pgjwt"; Type: COMMENT; Schema: -; Owner:
--

-- COMMENT ON EXTENSION "pgjwt" IS 'JSON Web Token API for Postgresql';


--
-- Name: supabase_vault; Type: EXTENSION; Schema: -; Owner: -
--

CREATE EXTENSION IF NOT EXISTS "supabase_vault" WITH SCHEMA "vault";


--
-- Name: EXTENSION "supabase_vault"; Type: COMMENT; Schema: -; Owner:
--

-- COMMENT ON EXTENSION "supabase_vault" IS 'Supabase Vault Extension';


--
-- Name: uuid-ossp; Type: EXTENSION; Schema: -; Owner: -
--

CREATE EXTENSION IF NOT EXISTS "uuid-ossp" WITH SCHEMA "extensions";


--
-- Name: EXTENSION "uuid-ossp"; Type: COMMENT; Schema: -; Owner:
--

-- COMMENT ON EXTENSION "uuid-ossp" IS 'generate universally unique identifiers (UUIDs)';


--
-- Name: user_role; Type: TYPE; Schema: public; Owner: postgres
--

CREATE TYPE "public"."user_role" AS ENUM (
    'super_admin',
    'admin',
    'aom',
    'supervisor',
    'lead_tech',
    'technician'
);


ALTER TYPE "public"."user_role" OWNER TO "postgres";

--
-- Name: TYPE "user_role"; Type: COMMENT; Schema: public; Owner: postgres
--

COMMENT ON TYPE "public"."user_role" IS 'Role hierarchy: super_admin > admin > aom > supervisor > lead_tech > technician';


--
-- Name: admin_create_user("text", "text", "text", "text", integer, "uuid"); Type: FUNCTION; Schema: public; Owner: postgres
--

CREATE OR REPLACE FUNCTION "public"."admin_create_user"("p_email" "text", "p_password" "text", "p_display_name" "text", "p_role" "text", "p_market_id" integer DEFAULT NULL::integer, "p_reports_to_user_id" "uuid" DEFAULT NULL::"uuid") RETURNS "json"
    LANGUAGE "plpgsql" SECURITY DEFINER
    SET "search_path" TO 'extensions', 'public', 'auth'
    AS $$
DECLARE
  v_user_id UUID;
  v_encrypted_password TEXT;
  v_result JSON;
  v_caller_role TEXT;
  v_caller_market_id INTEGER;
BEGIN
  -- Get the calling user's role and market
  SELECT role, market_id INTO v_caller_role, v_caller_market_id
  FROM user_profiles
  WHERE user_id = auth.uid();

  -- Check if the calling user has permission to create users
  IF v_caller_role NOT IN ('super_admin', 'admin', 'aom', 'supervisor') THEN
    RAISE EXCEPTION 'You do not have permission to create users';
  END IF;

  -- Validate role hierarchy and permissions
  IF v_caller_role = 'supervisor' THEN
    -- Supervisors can only create lead_tech and technician
    IF p_role NOT IN ('lead_tech', 'technician') THEN
      RAISE EXCEPTION 'Supervisors can only create Lead Technicians and Technicians';
    END IF;
    -- Supervisors must create users in their own market
    IF p_market_id IS NULL OR p_market_id != v_caller_market_id THEN
      RAISE EXCEPTION 'Supervisors can only create users in their own market';
    END IF;
  ELSIF v_caller_role = 'aom' THEN
    -- AOMs can create supervisor, lead_tech, and technician
    IF p_role NOT IN ('supervisor', 'lead_tech', 'technician') THEN
      RAISE EXCEPTION 'AOMs can only create Supervisors, Lead Technicians, and Technicians';
    END IF;
    -- AOMs must create users in their own market
    IF p_market_id IS NULL OR p_market_id != v_caller_market_id THEN
      RAISE EXCEPTION 'AOMs can only create users in their own market';
    END IF;
  ELSIF v_caller_role = 'admin' THEN
    -- Admins can create aom, supervisor, lead_tech, and technician
    IF p_role NOT IN ('aom', 'supervisor', 'lead_tech', 'technician') THEN
      RAISE EXCEPTION 'Admins can only create AOMs, Supervisors, Lead Technicians, and Technicians';
    END IF;
  -- super_admin can create any role (no restrictions)
  END IF;

  -- Check if email already exists
  IF EXISTS (SELECT 1 FROM auth.users WHERE email = p_email) THEN
    RAISE EXCEPTION 'User with email % already exists', p_email;
  END IF;

  -- Validate role is valid
  IF p_role NOT IN ('super_admin', 'admin', 'aom', 'supervisor', 'lead_tech', 'technician') THEN
    RAISE EXCEPTION 'Invalid role: %', p_role;
  END IF;

  -- Generate a new UUID for the user
  v_user_id := gen_random_uuid();

  -- Encrypt the password using pgcrypto's crypt function with full schema qualification
  v_encrypted_password := extensions.crypt(p_password, extensions.gen_salt('bf'));

  -- Insert into auth.users table
  INSERT INTO auth.users (
    id,
    instance_id,
    email,
    encrypted_password,
    email_confirmed_at,
    raw_app_meta_data,
    raw_user_meta_data,
    aud,
    role,
    created_at,
    updated_at,
    confirmation_token,
    recovery_token,
    email_change_token_new,
    email_change
  ) VALUES (
    v_user_id,
    '00000000-0000-0000-0000-000000000000'::UUID,
    p_email,
    v_encrypted_password,
    NOW(), -- Auto-confirm email
    jsonb_build_object('provider', 'email', 'providers', jsonb_build_array('email')),
    jsonb_build_object('display_name', p_display_name),
    'authenticated',
    'authenticated',
    NOW(),
    NOW(),
    '',
    '',
    '',
    ''
  );

  -- Insert into auth.identities table
  INSERT INTO auth.identities (
    id,
    user_id,
    identity_data,
    provider,
    provider_id,
    last_sign_in_at,
    created_at,
    updated_at
  ) VALUES (
    gen_random_uuid(),
    v_user_id,
    jsonb_build_object('sub', v_user_id::TEXT, 'email', p_email),
    'email',
    v_user_id::TEXT,
    NOW(),
    NOW(),
    NOW()
  );

  -- Create user profile
  INSERT INTO public.user_profiles (
    user_id,
    display_name,
    email,
    role,
    market_id,
    reports_to_user_id,
    is_active,
    created_at,
    updated_at
  ) VALUES (
    v_user_id,
    p_display_name,
    p_email,
    p_role::user_role,
    p_market_id,
    p_reports_to_user_id,
    TRUE,
    NOW(),
    NOW()
  );

  -- Return success with user data
  v_result := json_build_object(
    'success', TRUE,
    'user_id', v_user_id,
    'email', p_email,
    'display_name', p_display_name,
    'role', p_role
  );

  RETURN v_result;

EXCEPTION
  WHEN OTHERS THEN
    -- Return error information
    RETURN json_build_object(
      'success', FALSE,
      'error', SQLERRM
    );
END;
$$;


ALTER FUNCTION "public"."admin_create_user"("p_email" "text", "p_password" "text", "p_display_name" "text", "p_role" "text", "p_market_id" integer, "p_reports_to_user_id" "uuid") OWNER TO "postgres";

--
-- Name: FUNCTION "admin_create_user"("p_email" "text", "p_password" "text", "p_display_name" "text", "p_role" "text", "p_market_id" integer, "p_reports_to_user_id" "uuid"); Type: COMMENT; Schema: public; Owner: postgres
--

COMMENT ON FUNCTION "public"."admin_create_user"("p_email" "text", "p_password" "text", "p_display_name" "text", "p_role" "text", "p_market_id" integer, "p_reports_to_user_id" "uuid") IS 'Creates a new user with auth account and profile. Only accessible to admin users.';


--
-- Name: can_create_content(); Type: FUNCTION; Schema: public; Owner: postgres
--

CREATE OR REPLACE FUNCTION "public"."can_create_content"() RETURNS boolean
    LANGUAGE "sql" STABLE SECURITY DEFINER
    SET "search_path" TO 'public', 'auth'
    AS $$
  SELECT EXISTS (
    SELECT 1 FROM user_profiles
    WHERE user_id = auth.uid()
    AND role IN ('super_admin', 'admin', 'aom', 'supervisor', 'lead_tech')
    AND is_active = TRUE
  );
$$;


ALTER FUNCTION "public"."can_create_content"() OWNER TO "postgres";

--
-- Name: FUNCTION "can_create_content"(); Type: COMMENT; Schema: public; Owner: postgres
--

COMMENT ON FUNCTION "public"."can_create_content"() IS 'Checks if the current user can create new content';


--
-- Name: can_edit_content("uuid", integer); Type: FUNCTION; Schema: public; Owner: postgres
--

CREATE OR REPLACE FUNCTION "public"."can_edit_content"("content_created_by" "uuid", "content_market_id" integer) RETURNS boolean
    LANGUAGE "plpgsql" STABLE SECURITY DEFINER
    SET "search_path" TO 'public', 'auth'
    AS $$
DECLARE
  v_role user_role;
  v_market INTEGER;
BEGIN
  SELECT role, market_id INTO v_role, v_market
  FROM user_profiles WHERE user_id = auth.uid();

  IF v_role IS NULL THEN
    RETURN FALSE;
  END IF;

  -- Super Admin and Admin can edit everything
  IF v_role IN ('super_admin', 'admin') THEN
    RETURN TRUE;
  END IF;

  -- AOM and Supervisor can edit content in their market
  IF v_role IN ('aom', 'supervisor') AND content_market_id = v_market THEN
    RETURN TRUE;
  END IF;

  -- Lead Tech can only edit their own content
  IF v_role = 'lead_tech' AND content_created_by = auth.uid() THEN
    RETURN TRUE;
  END IF;

  RETURN FALSE;
END;
$$;


ALTER FUNCTION "public"."can_edit_content"("content_created_by" "uuid", "content_market_id" integer) OWNER TO "postgres";

--
-- Name: FUNCTION "can_edit_content"("content_created_by" "uuid", "content_market_id" integer); Type: COMMENT; Schema: public; Owner: postgres
--

COMMENT ON FUNCTION "public"."can_edit_content"("content_created_by" "uuid", "content_market_id" integer) IS 'Checks if the current user can edit content based on ownership and market';


--
-- Name: can_manage_user("uuid"); Type: FUNCTION; Schema: public; Owner: postgres
--

CREATE OR REPLACE FUNCTION "public"."can_manage_user"("target_user_id" "uuid") RETURNS boolean
    LANGUAGE "plpgsql" STABLE SECURITY DEFINER
    SET "search_path" TO 'public', 'auth'
    AS $$
DECLARE
  v_my_role user_role;
  v_my_market INTEGER;
  v_target_role user_role;
  v_target_market INTEGER;
BEGIN
  -- Get my profile
  SELECT role, market_id INTO v_my_role, v_my_market
  FROM user_profiles WHERE user_id = auth.uid();

  -- Get target profile
  SELECT role, market_id INTO v_target_role, v_target_market
  FROM user_profiles WHERE user_id = target_user_id;

  -- Super Admin can manage everyone except themselves
  IF v_my_role = 'super_admin' AND target_user_id != auth.uid() THEN
    RETURN TRUE;
  END IF;

  -- Admin can manage non-super users
  IF v_my_role = 'admin' AND v_target_role NOT IN ('super_admin', 'admin') THEN
    RETURN TRUE;
  END IF;

  -- AOM can manage Supervisors and Lead Techs in their market
  IF v_my_role = 'aom'
     AND v_target_role IN ('supervisor', 'lead_tech', 'technician')
     AND v_target_market = v_my_market THEN
    RETURN TRUE;
  END IF;

  -- Supervisor can manage Lead Techs and Technicians in their market
  IF v_my_role = 'supervisor'
     AND v_target_role IN ('lead_tech', 'technician')
     AND v_target_market = v_my_market THEN
    RETURN TRUE;
  END IF;

  RETURN FALSE;
END;
$$;


ALTER FUNCTION "public"."can_manage_user"("target_user_id" "uuid") OWNER TO "postgres";

--
-- Name: FUNCTION "can_manage_user"("target_user_id" "uuid"); Type: COMMENT; Schema: public; Owner: postgres
--

COMMENT ON FUNCTION "public"."can_manage_user"("target_user_id" "uuid") IS 'Checks if the current user can manage (view/edit) another user based on role hierarchy and market';


--
-- Name: can_view_content(integer, boolean); Type: FUNCTION; Schema: public; Owner: postgres
--

CREATE OR REPLACE FUNCTION "public"."can_view_content"("content_market_id" integer, "content_is_nationwide" boolean) RETURNS boolean
    LANGUAGE "plpgsql" STABLE SECURITY DEFINER
    SET "search_path" TO 'public', 'auth'
    AS $$
DECLARE
  v_role user_role;
  v_market INTEGER;
BEGIN
  -- Get user's role and market
  SELECT role, market_id INTO v_role, v_market
  FROM user_profiles WHERE user_id = auth.uid();

  -- No profile = no access (except for public content handling elsewhere)
  IF v_role IS NULL THEN
    RETURN FALSE;
  END IF;

  -- Super Admin and Admin can view everything
  IF v_role IN ('super_admin', 'admin') THEN
    RETURN TRUE;
  END IF;

  -- Everyone can view nationwide content
  IF content_is_nationwide = TRUE THEN
    RETURN TRUE;
  END IF;

  -- Regional users can view content from their market
  IF content_market_id = v_market THEN
    RETURN TRUE;
  END IF;

  RETURN FALSE;
END;
$$;


ALTER FUNCTION "public"."can_view_content"("content_market_id" integer, "content_is_nationwide" boolean) OWNER TO "postgres";

--
-- Name: FUNCTION "can_view_content"("content_market_id" integer, "content_is_nationwide" boolean); Type: COMMENT; Schema: public; Owner: postgres
--

COMMENT ON FUNCTION "public"."can_view_content"("content_market_id" integer, "content_is_nationwide" boolean) IS 'Checks if the current user can view content based on market and nationwide visibility';


--
-- Name: ensure_single_default_configuration(); Type: FUNCTION; Schema: public; Owner: postgres
--

CREATE OR REPLACE FUNCTION "public"."ensure_single_default_configuration"() RETURNS "trigger"
    LANGUAGE "plpgsql"
    SET "search_path" TO 'public'
    AS $$
BEGIN
    -- If setting a configuration as default, unset all other defaults for this user
    IF NEW.is_default = true THEN
        UPDATE dashboard_configurations
        SET is_default = false
        WHERE user_id = NEW.user_id
          AND id != NEW.id
          AND is_default = true;
    END IF;

    RETURN NEW;
END;
$$;


ALTER FUNCTION "public"."ensure_single_default_configuration"() OWNER TO "postgres";

--
-- Name: FUNCTION "ensure_single_default_configuration"(); Type: COMMENT; Schema: public; Owner: postgres
--

COMMENT ON FUNCTION "public"."ensure_single_default_configuration"() IS 'Legacy: Ensures only one default configuration per user - SECURITY: search_path set';


--
-- Name: ensure_single_default_dashboard(); Type: FUNCTION; Schema: public; Owner: postgres
--

CREATE OR REPLACE FUNCTION "public"."ensure_single_default_dashboard"() RETURNS "trigger"
    LANGUAGE "plpgsql"
    SET "search_path" TO 'public'
    AS $$
BEGIN
    -- If setting a dashboard as default, unset all other defaults for this user
    IF NEW.is_default = true THEN
        UPDATE user_dashboards
        SET is_default = false
        WHERE user_id = NEW.user_id
          AND id != NEW.id
          AND is_default = true;
    END IF;

    RETURN NEW;
END;
$$;


ALTER FUNCTION "public"."ensure_single_default_dashboard"() OWNER TO "postgres";

--
-- Name: FUNCTION "ensure_single_default_dashboard"(); Type: COMMENT; Schema: public; Owner: postgres
--

COMMENT ON FUNCTION "public"."ensure_single_default_dashboard"() IS 'Ensures only one default dashboard per user - SECURITY: search_path set';


--
-- Name: ensure_single_default_layout(); Type: FUNCTION; Schema: public; Owner: postgres
--

CREATE OR REPLACE FUNCTION "public"."ensure_single_default_layout"() RETURNS "trigger"
    LANGUAGE "plpgsql"
    SET "search_path" TO 'public'
    AS $$
BEGIN
    -- If setting a layout as default, unset all other defaults for this user
    IF NEW.is_default = true THEN
        UPDATE dashboard_layouts
        SET is_default = false
        WHERE user_id = NEW.user_id
          AND id != NEW.id
          AND is_default = true;
    END IF;

    RETURN NEW;
END;
$$;


ALTER FUNCTION "public"."ensure_single_default_layout"() OWNER TO "postgres";

--
-- Name: FUNCTION "ensure_single_default_layout"(); Type: COMMENT; Schema: public; Owner: postgres
--

COMMENT ON FUNCTION "public"."ensure_single_default_layout"() IS 'Legacy: Ensures only one default layout per user - SECURITY: search_path set';


--
-- Name: get_user_market_id(); Type: FUNCTION; Schema: public; Owner: postgres
--

CREATE OR REPLACE FUNCTION "public"."get_user_market_id"() RETURNS integer
    LANGUAGE "sql" STABLE SECURITY DEFINER
    SET "search_path" TO 'public', 'auth'
    AS $$
  SELECT market_id FROM user_profiles WHERE user_id = auth.uid();
$$;


ALTER FUNCTION "public"."get_user_market_id"() OWNER TO "postgres";

--
-- Name: FUNCTION "get_user_market_id"(); Type: COMMENT; Schema: public; Owner: postgres
--

COMMENT ON FUNCTION "public"."get_user_market_id"() IS 'Returns the market_id of the currently authenticated user';


SET default_tablespace = '';

SET default_table_access_method = "heap";

--
-- Name: user_profiles; Type: TABLE; Schema: public; Owner: postgres
--

CREATE TABLE IF NOT EXISTS "public"."user_profiles" (
    "user_id" "uuid" NOT NULL,
    "role" "public"."user_role" DEFAULT 'technician'::"public"."user_role" NOT NULL,
    "market_id" integer,
    "reports_to_user_id" "uuid",
    "display_name" "text" NOT NULL,
    "email" "text",
    "is_active" boolean DEFAULT true,
    "created_at" timestamp with time zone DEFAULT "now"(),
    "updated_at" timestamp with time zone DEFAULT "now"(),
    "preferences" "jsonb" DEFAULT '{}'::"jsonb",
    CONSTRAINT "valid_market_for_role" CHECK (((("role" = ANY (ARRAY['super_admin'::"public"."user_role", 'admin'::"public"."user_role"])) AND ("market_id" IS NULL)) OR (("role" <> ALL (ARRAY['super_admin'::"public"."user_role", 'admin'::"public"."user_role"])) AND ("market_id" IS NOT NULL)))),
    CONSTRAINT "valid_reports_to" CHECK (((("role" = ANY (ARRAY['super_admin'::"public"."user_role", 'admin'::"public"."user_role", 'aom'::"public"."user_role"])) AND ("reports_to_user_id" IS NULL)) OR ("role" <> ALL (ARRAY['super_admin'::"public"."user_role", 'admin'::"public"."user_role", 'aom'::"public"."user_role"]))))
);


ALTER TABLE "public"."user_profiles" OWNER TO "postgres";

--
-- Name: TABLE "user_profiles"; Type: COMMENT; Schema: public; Owner: postgres
--

COMMENT ON TABLE "public"."user_profiles" IS 'Extended user profile with role and market assignment';


--
-- Name: COLUMN "user_profiles"."role"; Type: COMMENT; Schema: public; Owner: postgres
--

COMMENT ON COLUMN "public"."user_profiles"."role" IS 'User role determining permissions';


--
-- Name: COLUMN "user_profiles"."market_id"; Type: COMMENT; Schema: public; Owner: postgres
--

COMMENT ON COLUMN "public"."user_profiles"."market_id" IS 'Market/region the user belongs to (NULL for nationwide roles)';


--
-- Name: COLUMN "user_profiles"."reports_to_user_id"; Type: COMMENT; Schema: public; Owner: postgres
--

COMMENT ON COLUMN "public"."user_profiles"."reports_to_user_id" IS 'Hierarchical reporting relationship';


--
-- Name: COLUMN "user_profiles"."display_name"; Type: COMMENT; Schema: public; Owner: postgres
--

COMMENT ON COLUMN "public"."user_profiles"."display_name" IS 'User full name for display';


--
-- Name: COLUMN "user_profiles"."email"; Type: COMMENT; Schema: public; Owner: postgres
--

COMMENT ON COLUMN "public"."user_profiles"."email" IS 'Cached email from auth.users for easier querying';


--
-- Name: COLUMN "user_profiles"."is_active"; Type: COMMENT; Schema: public; Owner: postgres
--

COMMENT ON COLUMN "public"."user_profiles"."is_active" IS 'Whether user account is active (can login)';


--
-- Name: COLUMN "user_profiles"."preferences"; Type: COMMENT; Schema: public; Owner: postgres
--

COMMENT ON COLUMN "public"."user_profiles"."preferences" IS 'User-specific preferences including theme settings, dashboard layout, etc.';


--
-- Name: get_user_profile(); Type: FUNCTION; Schema: public; Owner: postgres
--

CREATE OR REPLACE FUNCTION "public"."get_user_profile"() RETURNS "public"."user_profiles"
    LANGUAGE "sql" STABLE SECURITY DEFINER
    SET "search_path" TO 'public', 'auth'
    AS $$
  SELECT * FROM user_profiles WHERE user_id = auth.uid();
$$;


ALTER FUNCTION "public"."get_user_profile"() OWNER TO "postgres";

--
-- Name: FUNCTION "get_user_profile"(); Type: COMMENT; Schema: public; Owner: postgres
--

COMMENT ON FUNCTION "public"."get_user_profile"() IS 'Returns the full user profile for the currently authenticated user';


--
-- Name: get_user_role(); Type: FUNCTION; Schema: public; Owner: postgres
--

CREATE OR REPLACE FUNCTION "public"."get_user_role"() RETURNS "public"."user_role"
    LANGUAGE "sql" STABLE SECURITY DEFINER
    SET "search_path" TO 'public', 'auth'
    AS $$
  SELECT role FROM user_profiles WHERE user_id = auth.uid();
$$;


ALTER FUNCTION "public"."get_user_role"() OWNER TO "postgres";

--
-- Name: FUNCTION "get_user_role"(); Type: COMMENT; Schema: public; Owner: postgres
--

COMMENT ON FUNCTION "public"."get_user_role"() IS 'Returns the role of the currently authenticated user';


--
-- Name: is_admin(); Type: FUNCTION; Schema: public; Owner: postgres
--

CREATE OR REPLACE FUNCTION "public"."is_admin"() RETURNS boolean
    LANGUAGE "sql" STABLE SECURITY DEFINER
    SET "search_path" TO 'public', 'auth'
    AS $$
  SELECT EXISTS (
    SELECT 1 FROM user_profiles
    WHERE user_id = auth.uid()
    AND role IN ('super_admin', 'admin')
  );
$$;


ALTER FUNCTION "public"."is_admin"() OWNER TO "postgres";

--
-- Name: FUNCTION "is_admin"(); Type: COMMENT; Schema: public; Owner: postgres
--

COMMENT ON FUNCTION "public"."is_admin"() IS 'Returns TRUE if the current user is a Super Admin or Admin';


--
-- Name: is_super_admin(); Type: FUNCTION; Schema: public; Owner: postgres
--

CREATE OR REPLACE FUNCTION "public"."is_super_admin"() RETURNS boolean
    LANGUAGE "sql" STABLE SECURITY DEFINER
    SET "search_path" TO 'public', 'auth'
    AS $$
  SELECT EXISTS (
    SELECT 1 FROM user_profiles
    WHERE user_id = auth.uid()
    AND role = 'super_admin'
  );
$$;


ALTER FUNCTION "public"."is_super_admin"() OWNER TO "postgres";

--
-- Name: FUNCTION "is_super_admin"(); Type: COMMENT; Schema: public; Owner: postgres
--

COMMENT ON FUNCTION "public"."is_super_admin"() IS 'Returns TRUE if the current user is a Super Admin';


--
-- Name: migrate_existing_users_to_simple_dashboards(); Type: FUNCTION; Schema: public; Owner: postgres
--

CREATE OR REPLACE FUNCTION "public"."migrate_existing_users_to_simple_dashboards"() RETURNS TABLE("user_id" "uuid", "dashboards_created" integer, "success" boolean)
    LANGUAGE "plpgsql"
    SET "search_path" TO 'public', 'auth'
    AS $$
DECLARE
    user_record RECORD;
    template_record RECORD;
    dashboards_count INTEGER;
BEGIN
    -- Loop through all users who don't have dashboards yet
    FOR user_record IN
        SELECT DISTINCT u.id as uid
        FROM auth.users u
        LEFT JOIN user_dashboards ud ON u.id = ud.user_id AND ud.is_template = false
        WHERE ud.user_id IS NULL
    LOOP
        dashboards_count := 0;

        -- Copy each template to this user
        FOR template_record IN
            SELECT * FROM user_dashboards WHERE is_template = true
        LOOP
            INSERT INTO user_dashboards (
                user_id, name, description, tiles, filters, layout, is_template
            ) VALUES (
                user_record.uid,
                template_record.name,
                template_record.description,
                template_record.tiles,
                template_record.filters,
                template_record.layout,
                false
            );
            dashboards_count := dashboards_count + 1;
        END LOOP;

        -- Mark user as initialized
        INSERT INTO user_initialization (user_id, dashboard_templates_copied)
        VALUES (user_record.uid, true)
        ON CONFLICT (user_id) DO UPDATE SET
            dashboard_templates_copied = true,
            updated_at = NOW();

        -- Return result for this user
        RETURN QUERY SELECT user_record.uid, dashboards_count, true;
    END LOOP;

    RETURN;
END;
$$;


ALTER FUNCTION "public"."migrate_existing_users_to_simple_dashboards"() OWNER TO "postgres";

--
-- Name: FUNCTION "migrate_existing_users_to_simple_dashboards"(); Type: COMMENT; Schema: public; Owner: postgres
--

COMMENT ON FUNCTION "public"."migrate_existing_users_to_simple_dashboards"() IS 'Migrates existing users to new dashboard system - SECURITY: search_path set';


--
-- Name: trigger_set_timestamp(); Type: FUNCTION; Schema: public; Owner: postgres
--

CREATE OR REPLACE FUNCTION "public"."trigger_set_timestamp"() RETURNS "trigger"
    LANGUAGE "plpgsql"
    SET "search_path" TO 'public'
    AS $$
BEGIN
    NEW.updated_at = NOW();
    RETURN NEW;
END;
$$;


ALTER FUNCTION "public"."trigger_set_timestamp"() OWNER TO "postgres";

--
-- Name: FUNCTION "trigger_set_timestamp"(); Type: COMMENT; Schema: public; Owner: postgres
--

COMMENT ON FUNCTION "public"."trigger_set_timestamp"() IS 'Alias for update_updated_at_column - SECURITY: search_path set';


--
-- Name: update_dashboard_configurations_updated_at(); Type: FUNCTION; Schema: public; Owner: postgres
--

CREATE OR REPLACE FUNCTION "public"."update_dashboard_configurations_updated_at"() RETURNS "trigger"
    LANGUAGE "plpgsql"
    SET "search_path" TO 'public'
    AS $$
BEGIN
    NEW.updated_at = NOW();
    RETURN NEW;
END;
$$;


ALTER FUNCTION "public"."update_dashboard_configurations_updated_at"() OWNER TO "postgres";

--
-- Name: FUNCTION "update_dashboard_configurations_updated_at"(); Type: COMMENT; Schema: public; Owner: postgres
--

COMMENT ON FUNCTION "public"."update_dashboard_configurations_updated_at"() IS 'Legacy: Update dashboard configurations timestamp - SECURITY: search_path set';


--
-- Name: update_dashboard_layouts_updated_at(); Type: FUNCTION; Schema: public; Owner: postgres
--

CREATE OR REPLACE FUNCTION "public"."update_dashboard_layouts_updated_at"() RETURNS "trigger"
    LANGUAGE "plpgsql"
    SET "search_path" TO 'public'
    AS $$
BEGIN
    NEW.updated_at = NOW();
    RETURN NEW;
END;
$$;


ALTER FUNCTION "public"."update_dashboard_layouts_updated_at"() OWNER TO "postgres";

--
-- Name: FUNCTION "update_dashboard_layouts_updated_at"(); Type: COMMENT; Schema: public; Owner: postgres
--

COMMENT ON FUNCTION "public"."update_dashboard_layouts_updated_at"() IS 'Legacy: Update dashboard layouts timestamp - SECURITY: search_path set';


--
-- Name: update_updated_at_column(); Type: FUNCTION; Schema: public; Owner: postgres
--

CREATE OR REPLACE FUNCTION "public"."update_updated_at_column"() RETURNS "trigger"
    LANGUAGE "plpgsql"
    SET "search_path" TO 'public'
    AS $$
BEGIN
    NEW.updated_at = NOW();
    RETURN NEW;
END;
$$;


ALTER FUNCTION "public"."update_updated_at_column"() OWNER TO "postgres";

--
-- Name: FUNCTION "update_updated_at_column"(); Type: COMMENT; Schema: public; Owner: postgres
--

COMMENT ON FUNCTION "public"."update_updated_at_column"() IS 'Trigger function to update updated_at timestamp - SECURITY: search_path set';


--
-- Name: quiz_results; Type: TABLE; Schema: public; Owner: postgres
--

CREATE TABLE IF NOT EXISTS "public"."quiz_results" (
    "id" bigint NOT NULL,
    "ldap" "text" NOT NULL,
    "quiz_type" "text" NOT NULL,
    "date_of_test" timestamp with time zone DEFAULT "now"(),
    "score_text" "text" NOT NULL,
    "score_value" double precision NOT NULL,
    "supervisor" "text",
    "market" "text",
    "time_taken" real,
    "pdf_url" "text",
    "quiz_id" "uuid",
    "answers" "jsonb",
    "question_timings" "jsonb",
    "shuffled_questions" "jsonb"
);


ALTER TABLE "public"."quiz_results" OWNER TO "postgres";

--
-- Name: Service Tech Quiz Results_id_seq; Type: SEQUENCE; Schema: public; Owner: postgres
--

CREATE SEQUENCE IF NOT EXISTS "public"."Service Tech Quiz Results_id_seq"
    START WITH 1
    INCREMENT BY 1
    NO MINVALUE
    NO MAXVALUE
    CACHE 1;


ALTER TABLE "public"."Service Tech Quiz Results_id_seq" OWNER TO "postgres";

--
-- Name: Service Tech Quiz Results_id_seq; Type: SEQUENCE OWNED BY; Schema: public; Owner: postgres
--

ALTER SEQUENCE "public"."Service Tech Quiz Results_id_seq" OWNED BY "public"."quiz_results"."id";


--
-- Name: access_codes; Type: TABLE; Schema: public; Owner: postgres
--

CREATE TABLE IF NOT EXISTS "public"."access_codes" (
    "id" "uuid" DEFAULT "extensions"."uuid_generate_v4"() NOT NULL,
    "quiz_id" "uuid",
    "code" character varying(8) NOT NULL,
    "ldap" character varying NOT NULL,
    "email" character varying NOT NULL,
    "supervisor" character varying NOT NULL,
    "market" character varying NOT NULL,
    "is_used" boolean DEFAULT false,
    "created_at" timestamp with time zone DEFAULT "timezone"('utc'::"text", "now"()),
    "expires_at" timestamp with time zone
);


ALTER TABLE "public"."access_codes" OWNER TO "postgres";

--
-- Name: categories; Type: TABLE; Schema: public; Owner: postgres
--

CREATE TABLE IF NOT EXISTS "public"."categories" (
    "id" "uuid" DEFAULT "extensions"."uuid_generate_v4"() NOT NULL,
    "name" character varying NOT NULL,
    "description" "text",
    "section_id" "uuid" NOT NULL,
    "created_at" timestamp with time zone DEFAULT "timezone"('utc'::"text", "now"()),
    "updated_at" timestamp with time zone DEFAULT "timezone"('utc'::"text", "now"()),
    "display_order" integer DEFAULT 0,
    "icon" character varying,
    "created_by" "uuid",
    "market_id" integer,
    "is_nationwide" boolean DEFAULT false,
    "approved_by" "uuid",
    "approved_at" timestamp with time zone
);


ALTER TABLE "public"."categories" OWNER TO "postgres";

--
-- Name: TABLE "categories"; Type: COMMENT; Schema: public; Owner: postgres
--

COMMENT ON TABLE "public"."categories" IS 'Categories within sections for organizing content';


--
-- Name: COLUMN "categories"."icon"; Type: COMMENT; Schema: public; Owner: postgres
--

COMMENT ON COLUMN "public"."categories"."icon" IS 'Name of the icon to display for this category (e.g., "Book", "Network", "Download")';


--
-- Name: COLUMN "categories"."created_by"; Type: COMMENT; Schema: public; Owner: postgres
--

COMMENT ON COLUMN "public"."categories"."created_by" IS 'User who created this content';


--
-- Name: COLUMN "categories"."market_id"; Type: COMMENT; Schema: public; Owner: postgres
--

COMMENT ON COLUMN "public"."categories"."market_id" IS 'Market this content belongs to (NULL if nationwide)';


--
-- Name: COLUMN "categories"."is_nationwide"; Type: COMMENT; Schema: public; Owner: postgres
--

COMMENT ON COLUMN "public"."categories"."is_nationwide" IS 'TRUE if content is visible to all markets';


--
-- Name: COLUMN "categories"."approved_by"; Type: COMMENT; Schema: public; Owner: postgres
--

COMMENT ON COLUMN "public"."categories"."approved_by" IS 'Admin who approved regional content for nationwide visibility';


--
-- Name: COLUMN "categories"."approved_at"; Type: COMMENT; Schema: public; Owner: postgres
--

COMMENT ON COLUMN "public"."categories"."approved_at" IS 'When the content was approved for nationwide visibility';


--
-- Name: content_approval_requests; Type: TABLE; Schema: public; Owner: postgres
--

CREATE TABLE IF NOT EXISTS "public"."content_approval_requests" (
    "id" "uuid" DEFAULT "extensions"."uuid_generate_v4"() NOT NULL,
    "content_type" "text" NOT NULL,
    "content_id" "uuid" NOT NULL,
    "requested_by" "uuid" NOT NULL,
    "requested_at" timestamp with time zone DEFAULT "now"(),
    "status" "text" DEFAULT 'pending'::"text",
    "reviewed_by" "uuid",
    "reviewed_at" timestamp with time zone,
    "review_notes" "text",
    CONSTRAINT "content_approval_requests_content_type_check" CHECK (("content_type" = ANY (ARRAY['section'::"text", 'category'::"text", 'study_guide'::"text", 'quiz'::"text", 'question'::"text", 'media'::"text"]))),
    CONSTRAINT "content_approval_requests_status_check" CHECK (("status" = ANY (ARRAY['pending'::"text", 'approved'::"text", 'rejected'::"text"])))
);


ALTER TABLE "public"."content_approval_requests" OWNER TO "postgres";

--
-- Name: TABLE "content_approval_requests"; Type: COMMENT; Schema: public; Owner: postgres
--

COMMENT ON TABLE "public"."content_approval_requests" IS 'Workflow for promoting regional content to nationwide';


--
-- Name: COLUMN "content_approval_requests"."content_type"; Type: COMMENT; Schema: public; Owner: postgres
--

COMMENT ON COLUMN "public"."content_approval_requests"."content_type" IS 'Type of content being requested for approval';


--
-- Name: COLUMN "content_approval_requests"."content_id"; Type: COMMENT; Schema: public; Owner: postgres
--

COMMENT ON COLUMN "public"."content_approval_requests"."content_id" IS 'UUID of the content item';


--
-- Name: COLUMN "content_approval_requests"."requested_by"; Type: COMMENT; Schema: public; Owner: postgres
--

COMMENT ON COLUMN "public"."content_approval_requests"."requested_by" IS 'User who requested the approval';


--
-- Name: COLUMN "content_approval_requests"."status"; Type: COMMENT; Schema: public; Owner: postgres
--

COMMENT ON COLUMN "public"."content_approval_requests"."status" IS 'Current status: pending, approved, rejected';


--
-- Name: COLUMN "content_approval_requests"."reviewed_by"; Type: COMMENT; Schema: public; Owner: postgres
--

COMMENT ON COLUMN "public"."content_approval_requests"."reviewed_by" IS 'Admin who reviewed the request';


--
-- Name: COLUMN "content_approval_requests"."review_notes"; Type: COMMENT; Schema: public; Owner: postgres
--

COMMENT ON COLUMN "public"."content_approval_requests"."review_notes" IS 'Notes from the reviewer';


--
-- Name: markets; Type: TABLE; Schema: public; Owner: postgres
--

CREATE TABLE IF NOT EXISTS "public"."markets" (
    "id" integer NOT NULL,
    "name" character varying(255) NOT NULL,
    "created_at" timestamp with time zone DEFAULT CURRENT_TIMESTAMP
);


ALTER TABLE "public"."markets" OWNER TO "postgres";

--
-- Name: markets_id_seq; Type: SEQUENCE; Schema: public; Owner: postgres
--

CREATE SEQUENCE IF NOT EXISTS "public"."markets_id_seq"
    AS integer
    START WITH 1
    INCREMENT BY 1
    NO MINVALUE
    NO MAXVALUE
    CACHE 1;


ALTER TABLE "public"."markets_id_seq" OWNER TO "postgres";

--
-- Name: markets_id_seq; Type: SEQUENCE OWNED BY; Schema: public; Owner: postgres
--

ALTER SEQUENCE "public"."markets_id_seq" OWNED BY "public"."markets"."id";


--
-- Name: media_library; Type: TABLE; Schema: public; Owner: postgres
--

CREATE TABLE IF NOT EXISTS "public"."media_library" (
    "id" "uuid" DEFAULT "gen_random_uuid"() NOT NULL,
    "file_name" "text" NOT NULL,
    "storage_path" "text" NOT NULL,
    "public_url" "text" NOT NULL,
    "mime_type" "text" NOT NULL,
    "size" bigint NOT NULL,
    "alt_text" "text",
    "caption" "text",
    "uploaded_by" "uuid",
    "created_at" timestamp with time zone DEFAULT "now"() NOT NULL,
    "updated_at" timestamp with time zone DEFAULT "now"() NOT NULL,
    "created_by" "uuid",
    "market_id" integer,
    "is_nationwide" boolean DEFAULT false,
    "approved_by" "uuid",
    "approved_at" timestamp with time zone
);


ALTER TABLE "public"."media_library" OWNER TO "postgres";

--
-- Name: TABLE "media_library"; Type: COMMENT; Schema: public; Owner: postgres
--

COMMENT ON TABLE "public"."media_library" IS 'Stores metadata for uploaded media files.';


--
-- Name: COLUMN "media_library"."storage_path"; Type: COMMENT; Schema: public; Owner: postgres
--

COMMENT ON COLUMN "public"."media_library"."storage_path" IS 'Path to the file within the Supabase storage bucket (e.g., public/images/myfile.jpg)';


--
-- Name: COLUMN "media_library"."public_url"; Type: COMMENT; Schema: public; Owner: postgres
--

COMMENT ON COLUMN "public"."media_library"."public_url" IS 'Full public URL provided by Supabase storage.';


--
-- Name: COLUMN "media_library"."alt_text"; Type: COMMENT; Schema: public; Owner: postgres
--

COMMENT ON COLUMN "public"."media_library"."alt_text" IS 'Alternative text for accessibility, primarily for images.';


--
-- Name: COLUMN "media_library"."uploaded_by"; Type: COMMENT; Schema: public; Owner: postgres
--

COMMENT ON COLUMN "public"."media_library"."uploaded_by" IS 'The user who uploaded the file.';


--
-- Name: COLUMN "media_library"."created_by"; Type: COMMENT; Schema: public; Owner: postgres
--

COMMENT ON COLUMN "public"."media_library"."created_by" IS 'User who created this content';


--
-- Name: COLUMN "media_library"."market_id"; Type: COMMENT; Schema: public; Owner: postgres
--

COMMENT ON COLUMN "public"."media_library"."market_id" IS 'Market this content belongs to (NULL if nationwide)';


--
-- Name: COLUMN "media_library"."is_nationwide"; Type: COMMENT; Schema: public; Owner: postgres
--

COMMENT ON COLUMN "public"."media_library"."is_nationwide" IS 'TRUE if content is visible to all markets';


--
-- Name: COLUMN "media_library"."approved_by"; Type: COMMENT; Schema: public; Owner: postgres
--

COMMENT ON COLUMN "public"."media_library"."approved_by" IS 'Admin who approved regional content for nationwide visibility';


--
-- Name: COLUMN "media_library"."approved_at"; Type: COMMENT; Schema: public; Owner: postgres
--

COMMENT ON COLUMN "public"."media_library"."approved_at" IS 'When the content was approved for nationwide visibility';


--
-- Name: questions; Type: TABLE; Schema: public; Owner: postgres
--

CREATE TABLE IF NOT EXISTS "public"."questions" (
    "id" "uuid" DEFAULT "extensions"."uuid_generate_v4"() NOT NULL,
    "category_id" "uuid",
    "question_text" "text" NOT NULL,
    "question_type" character varying NOT NULL,
    "options" "jsonb",
    "correct_answer" "jsonb" NOT NULL,
    "explanation" "text",
    "created_at" timestamp with time zone DEFAULT "timezone"('utc'::"text", "now"()),
    "updated_at" timestamp with time zone DEFAULT "timezone"('utc'::"text", "now"()),
    "created_by" "uuid",
    "market_id" integer,
    "is_nationwide" boolean DEFAULT false,
    "approved_by" "uuid",
    "approved_at" timestamp with time zone,
    CONSTRAINT "v2_questions_question_type_check" CHECK ((("question_type")::"text" = ANY (ARRAY[('multiple_choice'::character varying)::"text", ('check_all_that_apply'::character varying)::"text", ('true_false'::character varying)::"text"])))
);


ALTER TABLE "public"."questions" OWNER TO "postgres";

--
-- Name: TABLE "questions"; Type: COMMENT; Schema: public; Owner: postgres
--

COMMENT ON TABLE "public"."questions" IS 'Question bank organized by categories';


--
-- Name: COLUMN "questions"."created_by"; Type: COMMENT; Schema: public; Owner: postgres
--

COMMENT ON COLUMN "public"."questions"."created_by" IS 'User who created this content';


--
-- Name: COLUMN "questions"."market_id"; Type: COMMENT; Schema: public; Owner: postgres
--

COMMENT ON COLUMN "public"."questions"."market_id" IS 'Market this content belongs to (NULL if nationwide)';


--
-- Name: COLUMN "questions"."is_nationwide"; Type: COMMENT; Schema: public; Owner: postgres
--

COMMENT ON COLUMN "public"."questions"."is_nationwide" IS 'TRUE if content is visible to all markets';


--
-- Name: COLUMN "questions"."approved_by"; Type: COMMENT; Schema: public; Owner: postgres
--

COMMENT ON COLUMN "public"."questions"."approved_by" IS 'Admin who approved regional content for nationwide visibility';


--
-- Name: COLUMN "questions"."approved_at"; Type: COMMENT; Schema: public; Owner: postgres
--

COMMENT ON COLUMN "public"."questions"."approved_at" IS 'When the content was approved for nationwide visibility';


--
-- Name: quiz_questions; Type: TABLE; Schema: public; Owner: postgres
--

CREATE TABLE IF NOT EXISTS "public"."quiz_questions" (
    "quiz_id" "uuid" NOT NULL,
    "question_id" "uuid" NOT NULL,
    "order_index" integer,
    "created_at" timestamp with time zone DEFAULT "timezone"('utc'::"text", "now"())
);


ALTER TABLE "public"."quiz_questions" OWNER TO "postgres";

--
-- Name: TABLE "quiz_questions"; Type: COMMENT; Schema: public; Owner: postgres
--

COMMENT ON TABLE "public"."quiz_questions" IS 'Junction table linking quizzes to their questions';


--
-- Name: quizzes; Type: TABLE; Schema: public; Owner: postgres
--

CREATE TABLE IF NOT EXISTS "public"."quizzes" (
    "id" "uuid" DEFAULT "extensions"."uuid_generate_v4"() NOT NULL,
    "title" character varying NOT NULL,
    "description" "text",
    "category_ids" "jsonb" NOT NULL,
    "time_limit" integer,
    "passing_score" numeric,
    "is_practice" boolean DEFAULT false,
    "created_at" timestamp with time zone DEFAULT "timezone"('utc'::"text", "now"()),
    "updated_at" timestamp with time zone DEFAULT "timezone"('utc'::"text", "now"()),
    "has_practice_mode" boolean DEFAULT false,
    "randomize_questions" boolean DEFAULT false NOT NULL,
    "randomize_answers" boolean DEFAULT false NOT NULL,
    "archived_at" timestamp with time zone,
    "allow_partial_credit" boolean DEFAULT false,
    "created_by" "uuid",
    "market_id" integer,
    "is_nationwide" boolean DEFAULT false,
    "approved_by" "uuid",
    "approved_at" timestamp with time zone
);


ALTER TABLE "public"."quizzes" OWNER TO "postgres";

--
-- Name: TABLE "quizzes"; Type: COMMENT; Schema: public; Owner: postgres
--

COMMENT ON TABLE "public"."quizzes" IS 'Quiz definitions with settings and metadata';


--
-- Name: COLUMN "quizzes"."archived_at"; Type: COMMENT; Schema: public; Owner: postgres
--

COMMENT ON COLUMN "public"."quizzes"."archived_at" IS 'Timestamp when the quiz was archived (soft deleted). NULL means the quiz is active.';


--
-- Name: COLUMN "quizzes"."allow_partial_credit"; Type: COMMENT; Schema: public; Owner: postgres
--

COMMENT ON COLUMN "public"."quizzes"."allow_partial_credit" IS 'When true, allows partial credit for check_all_that_apply questions based on percentage of correct selections. When false, requires all correct answers to get any points.';


--
-- Name: COLUMN "quizzes"."created_by"; Type: COMMENT; Schema: public; Owner: postgres
--

COMMENT ON COLUMN "public"."quizzes"."created_by" IS 'User who created this content';


--
-- Name: COLUMN "quizzes"."market_id"; Type: COMMENT; Schema: public; Owner: postgres
--

COMMENT ON COLUMN "public"."quizzes"."market_id" IS 'Market this content belongs to (NULL if nationwide)';


--
-- Name: COLUMN "quizzes"."is_nationwide"; Type: COMMENT; Schema: public; Owner: postgres
--

COMMENT ON COLUMN "public"."quizzes"."is_nationwide" IS 'TRUE if content is visible to all markets';


--
-- Name: COLUMN "quizzes"."approved_by"; Type: COMMENT; Schema: public; Owner: postgres
--

COMMENT ON COLUMN "public"."quizzes"."approved_by" IS 'Admin who approved regional content for nationwide visibility';


--
-- Name: COLUMN "quizzes"."approved_at"; Type: COMMENT; Schema: public; Owner: postgres
--

COMMENT ON COLUMN "public"."quizzes"."approved_at" IS 'When the content was approved for nationwide visibility';


--
-- Name: sections; Type: TABLE; Schema: public; Owner: postgres
--

CREATE TABLE IF NOT EXISTS "public"."sections" (
    "id" "uuid" DEFAULT "extensions"."uuid_generate_v4"() NOT NULL,
    "name" character varying NOT NULL,
    "description" "text",
    "created_at" timestamp with time zone DEFAULT "timezone"('utc'::"text", "now"()),
    "updated_at" timestamp with time zone DEFAULT "timezone"('utc'::"text", "now"()),
    "display_order" integer DEFAULT 0,
    "icon" character varying,
    "created_by" "uuid",
    "market_id" integer,
    "is_nationwide" boolean DEFAULT false,
    "approved_by" "uuid",
    "approved_at" timestamp with time zone
);


ALTER TABLE "public"."sections" OWNER TO "postgres";

--
-- Name: TABLE "sections"; Type: COMMENT; Schema: public; Owner: postgres
--

COMMENT ON TABLE "public"."sections" IS 'Top-level content organization sections';


--
-- Name: COLUMN "sections"."icon"; Type: COMMENT; Schema: public; Owner: postgres
--

COMMENT ON COLUMN "public"."sections"."icon" IS 'Name of the icon to display for this section (e.g., "Book", "Network", "Download")';


--
-- Name: COLUMN "sections"."created_by"; Type: COMMENT; Schema: public; Owner: postgres
--

COMMENT ON COLUMN "public"."sections"."created_by" IS 'User who created this content';


--
-- Name: COLUMN "sections"."market_id"; Type: COMMENT; Schema: public; Owner: postgres
--

COMMENT ON COLUMN "public"."sections"."market_id" IS 'Market this content belongs to (NULL if nationwide)';


--
-- Name: COLUMN "sections"."is_nationwide"; Type: COMMENT; Schema: public; Owner: postgres
--

COMMENT ON COLUMN "public"."sections"."is_nationwide" IS 'TRUE if content is visible to all markets';


--
-- Name: COLUMN "sections"."approved_by"; Type: COMMENT; Schema: public; Owner: postgres
--

COMMENT ON COLUMN "public"."sections"."approved_by" IS 'Admin who approved regional content for nationwide visibility';


--
-- Name: COLUMN "sections"."approved_at"; Type: COMMENT; Schema: public; Owner: postgres
--

COMMENT ON COLUMN "public"."sections"."approved_at" IS 'When the content was approved for nationwide visibility';


--
-- Name: study_guide_templates; Type: TABLE; Schema: public; Owner: postgres
--

CREATE TABLE IF NOT EXISTS "public"."study_guide_templates" (
    "id" "uuid" DEFAULT "extensions"."uuid_generate_v4"() NOT NULL,
    "name" "text" NOT NULL,
    "description" "text",
    "thumbnail" "text",
    "content" "text" NOT NULL,
    "category" "text",
    "tags" "text"[],
    "created_at" timestamp with time zone DEFAULT "now"(),
    "updated_at" timestamp with time zone DEFAULT "now"()
);


ALTER TABLE "public"."study_guide_templates" OWNER TO "postgres";

--
-- Name: TABLE "study_guide_templates"; Type: COMMENT; Schema: public; Owner: postgres
--

COMMENT ON TABLE "public"."study_guide_templates" IS 'Templates for creating new study guides';


--
-- Name: study_guides; Type: TABLE; Schema: public; Owner: postgres
--

CREATE TABLE IF NOT EXISTS "public"."study_guides" (
    "id" "uuid" DEFAULT "extensions"."uuid_generate_v4"() NOT NULL,
    "category_id" "uuid" NOT NULL,
    "title" character varying NOT NULL,
    "content" "text" NOT NULL,
    "display_order" integer DEFAULT 0,
    "created_at" timestamp with time zone DEFAULT "timezone"('utc'::"text", "now"()),
    "updated_at" timestamp with time zone DEFAULT "timezone"('utc'::"text", "now"()),
    "is_published" boolean DEFAULT false,
    "description" "text",
    "linked_quiz_id" "uuid",
    "created_by" "uuid",
    "market_id" integer,
    "is_nationwide" boolean DEFAULT false,
    "approved_by" "uuid",
    "approved_at" timestamp with time zone
);


ALTER TABLE "public"."study_guides" OWNER TO "postgres";

--
-- Name: TABLE "study_guides"; Type: COMMENT; Schema: public; Owner: postgres
--

COMMENT ON TABLE "public"."study_guides" IS 'Study guide content organized by categories';


--
-- Name: COLUMN "study_guides"."is_published"; Type: COMMENT; Schema: public; Owner: postgres
--

COMMENT ON COLUMN "public"."study_guides"."is_published" IS 'Indicates whether the study guide is published and visible to public users. Default is false.';


--
-- Name: COLUMN "study_guides"."description"; Type: COMMENT; Schema: public; Owner: postgres
--

COMMENT ON COLUMN "public"."study_guides"."description" IS 'Optional custom description that overrides the auto-generated description when provided.';


--
-- Name: COLUMN "study_guides"."linked_quiz_id"; Type: COMMENT; Schema: public; Owner: postgres
--

COMMENT ON COLUMN "public"."study_guides"."linked_quiz_id" IS 'Optional reference to a specific quiz that should be used for the practice quiz button. If NULL, falls back to category-based quiz selection.';


--
-- Name: COLUMN "study_guides"."created_by"; Type: COMMENT; Schema: public; Owner: postgres
--

COMMENT ON COLUMN "public"."study_guides"."created_by" IS 'User who created this content';


--
-- Name: COLUMN "study_guides"."market_id"; Type: COMMENT; Schema: public; Owner: postgres
--

COMMENT ON COLUMN "public"."study_guides"."market_id" IS 'Market this content belongs to (NULL if nationwide)';


--
-- Name: COLUMN "study_guides"."is_nationwide"; Type: COMMENT; Schema: public; Owner: postgres
--

COMMENT ON COLUMN "public"."study_guides"."is_nationwide" IS 'TRUE if content is visible to all markets';


--
-- Name: COLUMN "study_guides"."approved_by"; Type: COMMENT; Schema: public; Owner: postgres
--

COMMENT ON COLUMN "public"."study_guides"."approved_by" IS 'Admin who approved regional content for nationwide visibility';


--
-- Name: COLUMN "study_guides"."approved_at"; Type: COMMENT; Schema: public; Owner: postgres
--

COMMENT ON COLUMN "public"."study_guides"."approved_at" IS 'When the content was approved for nationwide visibility';


--
-- Name: supervisors; Type: TABLE; Schema: public; Owner: postgres
--

CREATE TABLE IF NOT EXISTS "public"."supervisors" (
    "id" integer NOT NULL,
    "name" character varying(255) NOT NULL,
    "created_at" timestamp with time zone DEFAULT CURRENT_TIMESTAMP,
    "market_id" integer,
    "is_active" boolean DEFAULT true,
    "user_id" "uuid",
    "is_legacy" boolean DEFAULT true
);


ALTER TABLE "public"."supervisors" OWNER TO "postgres";

--
-- Name: COLUMN "supervisors"."market_id"; Type: COMMENT; Schema: public; Owner: postgres
--

COMMENT ON COLUMN "public"."supervisors"."market_id" IS 'Reference to the market this supervisor belongs to';


--
-- Name: COLUMN "supervisors"."is_active"; Type: COMMENT; Schema: public; Owner: postgres
--

COMMENT ON COLUMN "public"."supervisors"."is_active" IS 'Whether this supervisor is currently active and should appear in dropdown lists';


--
-- Name: COLUMN "supervisors"."user_id"; Type: COMMENT; Schema: public; Owner: postgres
--

COMMENT ON COLUMN "public"."supervisors"."user_id" IS 'Link to user account (if supervisor has an account)';


--
-- Name: COLUMN "supervisors"."is_legacy"; Type: COMMENT; Schema: public; Owner: postgres
--

COMMENT ON COLUMN "public"."supervisors"."is_legacy" IS 'TRUE for supervisors created before RBAC (dropdown-only entries)';


--
-- Name: supervisors_id_seq; Type: SEQUENCE; Schema: public; Owner: postgres
--

CREATE SEQUENCE IF NOT EXISTS "public"."supervisors_id_seq"
    AS integer
    START WITH 1
    INCREMENT BY 1
    NO MINVALUE
    NO MAXVALUE
    CACHE 1;


ALTER TABLE "public"."supervisors_id_seq" OWNER TO "postgres";

--
-- Name: supervisors_id_seq; Type: SEQUENCE OWNED BY; Schema: public; Owner: postgres
--

ALTER SEQUENCE "public"."supervisors_id_seq" OWNED BY "public"."supervisors"."id";


--
-- Name: user_dashboards; Type: TABLE; Schema: public; Owner: postgres
--

CREATE TABLE IF NOT EXISTS "public"."user_dashboards" (
    "id" "text" DEFAULT ((('dashboard_'::"text" || EXTRACT(epoch FROM "now"())) || '_'::"text") || "substr"("md5"(("random"())::"text"), 1, 8)) NOT NULL,
    "user_id" "uuid",
    "name" "text" NOT NULL,
    "description" "text" DEFAULT ''::"text",
    "tiles" "jsonb" DEFAULT '[]'::"jsonb" NOT NULL,
    "filters" "jsonb" DEFAULT '{}'::"jsonb",
    "layout" "jsonb" DEFAULT '{}'::"jsonb",
    "is_template" boolean DEFAULT false,
    "created_at" timestamp with time zone DEFAULT "now"(),
    "updated_at" timestamp with time zone DEFAULT "now"(),
    "is_default" boolean DEFAULT false NOT NULL,
    CONSTRAINT "user_dashboards_name_not_empty" CHECK (("length"(TRIM(BOTH FROM "name")) > 0))
);


ALTER TABLE "public"."user_dashboards" OWNER TO "postgres";

--
-- Name: COLUMN "user_dashboards"."is_default"; Type: COMMENT; Schema: public; Owner: postgres
--

COMMENT ON COLUMN "public"."user_dashboards"."is_default" IS 'Whether this is the default dashboard for the user';


--
-- Name: user_initialization; Type: TABLE; Schema: public; Owner: postgres
--

CREATE TABLE IF NOT EXISTS "public"."user_initialization" (
    "user_id" "uuid" NOT NULL,
    "initialized_at" timestamp with time zone DEFAULT "now"(),
    "dashboard_templates_copied" boolean DEFAULT false,
    "version" "text" DEFAULT '1.0.0'::"text",
    "created_at" timestamp with time zone DEFAULT "now"(),
    "updated_at" timestamp with time zone DEFAULT "now"()
);


ALTER TABLE "public"."user_initialization" OWNER TO "postgres";

--
-- Name: markets id; Type: DEFAULT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY "public"."markets" ALTER COLUMN "id" SET DEFAULT "nextval"('"public"."markets_id_seq"'::"regclass");


--
-- Name: quiz_results id; Type: DEFAULT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY "public"."quiz_results" ALTER COLUMN "id" SET DEFAULT "nextval"('"public"."Service Tech Quiz Results_id_seq"'::"regclass");


--
-- Name: supervisors id; Type: DEFAULT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY "public"."supervisors" ALTER COLUMN "id" SET DEFAULT "nextval"('"public"."supervisors_id_seq"'::"regclass");


--
-- Name: quiz_results Service Tech Quiz Results_pkey; Type: CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY "public"."quiz_results"
    ADD CONSTRAINT "Service Tech Quiz Results_pkey" PRIMARY KEY ("id");


--
-- Name: content_approval_requests content_approval_requests_pkey; Type: CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY "public"."content_approval_requests"
    ADD CONSTRAINT "content_approval_requests_pkey" PRIMARY KEY ("id");


--
-- Name: markets markets_name_key; Type: CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY "public"."markets"
    ADD CONSTRAINT "markets_name_key" UNIQUE ("name");


--
-- Name: markets markets_pkey; Type: CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY "public"."markets"
    ADD CONSTRAINT "markets_pkey" PRIMARY KEY ("id");


--
-- Name: media_library media_library_pkey; Type: CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY "public"."media_library"
    ADD CONSTRAINT "media_library_pkey" PRIMARY KEY ("id");


--
-- Name: media_library media_library_storage_path_key; Type: CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY "public"."media_library"
    ADD CONSTRAINT "media_library_storage_path_key" UNIQUE ("storage_path");


--
-- Name: supervisors supervisors_name_key; Type: CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY "public"."supervisors"
    ADD CONSTRAINT "supervisors_name_key" UNIQUE ("name");


--
-- Name: supervisors supervisors_pkey; Type: CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY "public"."supervisors"
    ADD CONSTRAINT "supervisors_pkey" PRIMARY KEY ("id");


--
-- Name: user_dashboards user_dashboards_pkey; Type: CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY "public"."user_dashboards"
    ADD CONSTRAINT "user_dashboards_pkey" PRIMARY KEY ("id");


--
-- Name: user_dashboards user_dashboards_user_name_unique; Type: CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY "public"."user_dashboards"
    ADD CONSTRAINT "user_dashboards_user_name_unique" UNIQUE ("user_id", "name");


--
-- Name: user_initialization user_initialization_pkey; Type: CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY "public"."user_initialization"
    ADD CONSTRAINT "user_initialization_pkey" PRIMARY KEY ("user_id");


--
-- Name: user_profiles user_profiles_pkey; Type: CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY "public"."user_profiles"
    ADD CONSTRAINT "user_profiles_pkey" PRIMARY KEY ("user_id");


--
-- Name: access_codes v2_access_codes_code_key; Type: CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY "public"."access_codes"
    ADD CONSTRAINT "v2_access_codes_code_key" UNIQUE ("code");


--
-- Name: access_codes v2_access_codes_pkey; Type: CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY "public"."access_codes"
    ADD CONSTRAINT "v2_access_codes_pkey" PRIMARY KEY ("id");


--
-- Name: categories v2_categories_pkey; Type: CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY "public"."categories"
    ADD CONSTRAINT "v2_categories_pkey" PRIMARY KEY ("id");


--
-- Name: questions v2_questions_pkey; Type: CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY "public"."questions"
    ADD CONSTRAINT "v2_questions_pkey" PRIMARY KEY ("id");


--
-- Name: quiz_questions v2_quiz_questions_pkey; Type: CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY "public"."quiz_questions"
    ADD CONSTRAINT "v2_quiz_questions_pkey" PRIMARY KEY ("quiz_id", "question_id");


--
-- Name: quizzes v2_quizzes_pkey; Type: CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY "public"."quizzes"
    ADD CONSTRAINT "v2_quizzes_pkey" PRIMARY KEY ("id");


--
-- Name: sections v2_sections_pkey; Type: CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY "public"."sections"
    ADD CONSTRAINT "v2_sections_pkey" PRIMARY KEY ("id");


--
-- Name: study_guide_templates v2_study_guide_templates_pkey; Type: CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY "public"."study_guide_templates"
    ADD CONSTRAINT "v2_study_guide_templates_pkey" PRIMARY KEY ("id");


--
-- Name: study_guides v2_study_guides_pkey; Type: CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY "public"."study_guides"
    ADD CONSTRAINT "v2_study_guides_pkey" PRIMARY KEY ("id");


--
-- Name: categories_display_order_idx; Type: INDEX; Schema: public; Owner: postgres
--

CREATE INDEX "categories_display_order_idx" ON "public"."categories" USING "btree" ("display_order");


--
-- Name: categories_pkey; Type: INDEX; Schema: public; Owner: postgres
--

CREATE INDEX "categories_pkey" ON "public"."categories" USING "btree" ("id");


--
-- Name: categories_section_id_idx; Type: INDEX; Schema: public; Owner: postgres
--

CREATE INDEX "categories_section_id_idx" ON "public"."categories" USING "btree" ("section_id");


--
-- Name: idx_approval_requests_content; Type: INDEX; Schema: public; Owner: postgres
--

CREATE INDEX "idx_approval_requests_content" ON "public"."content_approval_requests" USING "btree" ("content_type", "content_id");


--
-- Name: idx_approval_requests_pending_unique; Type: INDEX; Schema: public; Owner: postgres
--

CREATE UNIQUE INDEX "idx_approval_requests_pending_unique" ON "public"."content_approval_requests" USING "btree" ("content_type", "content_id") WHERE ("status" = 'pending'::"text");


--
-- Name: idx_approval_requests_requested_by; Type: INDEX; Schema: public; Owner: postgres
--

CREATE INDEX "idx_approval_requests_requested_by" ON "public"."content_approval_requests" USING "btree" ("requested_by");


--
-- Name: idx_approval_requests_status; Type: INDEX; Schema: public; Owner: postgres
--

CREATE INDEX "idx_approval_requests_status" ON "public"."content_approval_requests" USING "btree" ("status");


--
-- Name: idx_categories_created_by; Type: INDEX; Schema: public; Owner: postgres
--

CREATE INDEX "idx_categories_created_by" ON "public"."categories" USING "btree" ("created_by");


--
-- Name: idx_categories_visibility; Type: INDEX; Schema: public; Owner: postgres
--

CREATE INDEX "idx_categories_visibility" ON "public"."categories" USING "btree" ("is_nationwide", "market_id");


--
-- Name: idx_markets_name; Type: INDEX; Schema: public; Owner: postgres
--

CREATE INDEX "idx_markets_name" ON "public"."markets" USING "btree" ("name");


--
-- Name: idx_media_library_created_by; Type: INDEX; Schema: public; Owner: postgres
--

CREATE INDEX "idx_media_library_created_by" ON "public"."media_library" USING "btree" ("created_by");


--
-- Name: idx_media_library_visibility; Type: INDEX; Schema: public; Owner: postgres
--

CREATE INDEX "idx_media_library_visibility" ON "public"."media_library" USING "btree" ("is_nationwide", "market_id");


--
-- Name: idx_questions_created_by; Type: INDEX; Schema: public; Owner: postgres
--

CREATE INDEX "idx_questions_created_by" ON "public"."questions" USING "btree" ("created_by");


--
-- Name: idx_questions_visibility; Type: INDEX; Schema: public; Owner: postgres
--

CREATE INDEX "idx_questions_visibility" ON "public"."questions" USING "btree" ("is_nationwide", "market_id");


--
-- Name: idx_quiz_questions_question_id; Type: INDEX; Schema: public; Owner: postgres
--

CREATE INDEX "idx_quiz_questions_question_id" ON "public"."quiz_questions" USING "btree" ("question_id");


--
-- Name: idx_quiz_questions_quiz_id; Type: INDEX; Schema: public; Owner: postgres
--

CREATE INDEX "idx_quiz_questions_quiz_id" ON "public"."quiz_questions" USING "btree" ("quiz_id");


--
-- Name: idx_quiz_results_date_of_test; Type: INDEX; Schema: public; Owner: postgres
--

CREATE INDEX "idx_quiz_results_date_of_test" ON "public"."quiz_results" USING "btree" ("date_of_test" DESC);


--
-- Name: INDEX "idx_quiz_results_date_of_test"; Type: COMMENT; Schema: public; Owner: postgres
--

COMMENT ON INDEX "public"."idx_quiz_results_date_of_test" IS 'Optimizes date range queries and ORDER BY date_of_test DESC - addresses slow query from Supabase analysis';


--
-- Name: idx_quiz_results_filters; Type: INDEX; Schema: public; Owner: postgres
--

CREATE INDEX "idx_quiz_results_filters" ON "public"."quiz_results" USING "btree" ("date_of_test" DESC, "score_value", "time_taken");


--
-- Name: INDEX "idx_quiz_results_filters"; Type: COMMENT; Schema: public; Owner: postgres
--

COMMENT ON INDEX "public"."idx_quiz_results_filters" IS 'Composite index for multi-filter queries (date + score + time) - optimizes dashboard filtering';


--
-- Name: idx_quiz_results_market; Type: INDEX; Schema: public; Owner: postgres
--

CREATE INDEX "idx_quiz_results_market" ON "public"."quiz_results" USING "btree" ("market");


--
-- Name: INDEX "idx_quiz_results_market"; Type: COMMENT; Schema: public; Owner: postgres
--

COMMENT ON INDEX "public"."idx_quiz_results_market" IS 'Optimizes market-based filtering for regional managers';


--
-- Name: idx_quiz_results_quiz_id; Type: INDEX; Schema: public; Owner: postgres
--

CREATE INDEX "idx_quiz_results_quiz_id" ON "public"."quiz_results" USING "btree" ("quiz_id");


--
-- Name: INDEX "idx_quiz_results_quiz_id"; Type: COMMENT; Schema: public; Owner: postgres
--

COMMENT ON INDEX "public"."idx_quiz_results_quiz_id" IS 'Optimizes lookups by quiz_id for quiz-specific results';


--
-- Name: idx_quiz_results_supervisor; Type: INDEX; Schema: public; Owner: postgres
--

CREATE INDEX "idx_quiz_results_supervisor" ON "public"."quiz_results" USING "btree" ("supervisor");


--
-- Name: INDEX "idx_quiz_results_supervisor"; Type: COMMENT; Schema: public; Owner: postgres
--

COMMENT ON INDEX "public"."idx_quiz_results_supervisor" IS 'Optimizes supervisor-based filtering';


--
-- Name: idx_quizzes_archived_at; Type: INDEX; Schema: public; Owner: postgres
--

CREATE INDEX "idx_quizzes_archived_at" ON "public"."quizzes" USING "btree" ("archived_at");


--
-- Name: idx_quizzes_created_by; Type: INDEX; Schema: public; Owner: postgres
--

CREATE INDEX "idx_quizzes_created_by" ON "public"."quizzes" USING "btree" ("created_by");


--
-- Name: idx_quizzes_visibility; Type: INDEX; Schema: public; Owner: postgres
--

CREATE INDEX "idx_quizzes_visibility" ON "public"."quizzes" USING "btree" ("is_nationwide", "market_id");


--
-- Name: idx_sections_created_by; Type: INDEX; Schema: public; Owner: postgres
--

CREATE INDEX "idx_sections_created_by" ON "public"."sections" USING "btree" ("created_by");


--
-- Name: idx_sections_visibility; Type: INDEX; Schema: public; Owner: postgres
--

CREATE INDEX "idx_sections_visibility" ON "public"."sections" USING "btree" ("is_nationwide", "market_id");


--
-- Name: idx_study_guides_created_by; Type: INDEX; Schema: public; Owner: postgres
--

CREATE INDEX "idx_study_guides_created_by" ON "public"."study_guides" USING "btree" ("created_by");


--
-- Name: idx_study_guides_is_published; Type: INDEX; Schema: public; Owner: postgres
--

CREATE INDEX "idx_study_guides_is_published" ON "public"."study_guides" USING "btree" ("is_published");


--
-- Name: idx_study_guides_linked_quiz_id; Type: INDEX; Schema: public; Owner: postgres
--

CREATE INDEX "idx_study_guides_linked_quiz_id" ON "public"."study_guides" USING "btree" ("linked_quiz_id");


--
-- Name: idx_study_guides_visibility; Type: INDEX; Schema: public; Owner: postgres
--

CREATE INDEX "idx_study_guides_visibility" ON "public"."study_guides" USING "btree" ("is_nationwide", "market_id");


--
-- Name: idx_supervisors_active_market; Type: INDEX; Schema: public; Owner: postgres
--

CREATE INDEX "idx_supervisors_active_market" ON "public"."supervisors" USING "btree" ("market_id", "is_active");


--
-- Name: idx_supervisors_is_active; Type: INDEX; Schema: public; Owner: postgres
--

CREATE INDEX "idx_supervisors_is_active" ON "public"."supervisors" USING "btree" ("is_active");


--
-- Name: idx_supervisors_market_id; Type: INDEX; Schema: public; Owner: postgres
--

CREATE INDEX "idx_supervisors_market_id" ON "public"."supervisors" USING "btree" ("market_id");


--
-- Name: idx_supervisors_name; Type: INDEX; Schema: public; Owner: postgres
--

CREATE INDEX "idx_supervisors_name" ON "public"."supervisors" USING "btree" ("name");


--
-- Name: idx_supervisors_user_id; Type: INDEX; Schema: public; Owner: postgres
--

CREATE INDEX "idx_supervisors_user_id" ON "public"."supervisors" USING "btree" ("user_id");


--
-- Name: idx_user_dashboards_created_at; Type: INDEX; Schema: public; Owner: postgres
--

CREATE INDEX "idx_user_dashboards_created_at" ON "public"."user_dashboards" USING "btree" ("created_at");


--
-- Name: idx_user_dashboards_is_template; Type: INDEX; Schema: public; Owner: postgres
--

CREATE INDEX "idx_user_dashboards_is_template" ON "public"."user_dashboards" USING "btree" ("is_template");


--
-- Name: idx_user_dashboards_user_default; Type: INDEX; Schema: public; Owner: postgres
--

CREATE INDEX "idx_user_dashboards_user_default" ON "public"."user_dashboards" USING "btree" ("user_id", "is_default") WHERE ("is_default" = true);


--
-- Name: idx_user_dashboards_user_id; Type: INDEX; Schema: public; Owner: postgres
--

CREATE INDEX "idx_user_dashboards_user_id" ON "public"."user_dashboards" USING "btree" ("user_id");


--
-- Name: idx_user_initialization_initialized_at; Type: INDEX; Schema: public; Owner: postgres
--

CREATE INDEX "idx_user_initialization_initialized_at" ON "public"."user_initialization" USING "btree" ("initialized_at");


--
-- Name: idx_user_profiles_active; Type: INDEX; Schema: public; Owner: postgres
--

CREATE INDEX "idx_user_profiles_active" ON "public"."user_profiles" USING "btree" ("is_active") WHERE ("is_active" = true);


--
-- Name: idx_user_profiles_email; Type: INDEX; Schema: public; Owner: postgres
--

CREATE INDEX "idx_user_profiles_email" ON "public"."user_profiles" USING "btree" ("email");


--
-- Name: idx_user_profiles_market; Type: INDEX; Schema: public; Owner: postgres
--

CREATE INDEX "idx_user_profiles_market" ON "public"."user_profiles" USING "btree" ("market_id");


--
-- Name: idx_user_profiles_preferences; Type: INDEX; Schema: public; Owner: postgres
--

CREATE INDEX "idx_user_profiles_preferences" ON "public"."user_profiles" USING "gin" ("preferences");


--
-- Name: idx_user_profiles_reports_to; Type: INDEX; Schema: public; Owner: postgres
--

CREATE INDEX "idx_user_profiles_reports_to" ON "public"."user_profiles" USING "btree" ("reports_to_user_id");


--
-- Name: idx_user_profiles_role; Type: INDEX; Schema: public; Owner: postgres
--

CREATE INDEX "idx_user_profiles_role" ON "public"."user_profiles" USING "btree" ("role");


--
-- Name: questions_pkey; Type: INDEX; Schema: public; Owner: postgres
--

CREATE INDEX "questions_pkey" ON "public"."questions" USING "btree" ("id");


--
-- Name: quiz_questions_pkey; Type: INDEX; Schema: public; Owner: postgres
--

CREATE INDEX "quiz_questions_pkey" ON "public"."quiz_questions" USING "btree" ("quiz_id", "question_id");


--
-- Name: quizzes_pkey; Type: INDEX; Schema: public; Owner: postgres
--

CREATE INDEX "quizzes_pkey" ON "public"."quizzes" USING "btree" ("id");


--
-- Name: sections_display_order_idx; Type: INDEX; Schema: public; Owner: postgres
--

CREATE INDEX "sections_display_order_idx" ON "public"."sections" USING "btree" ("display_order");


--
-- Name: sections_pkey; Type: INDEX; Schema: public; Owner: postgres
--

CREATE INDEX "sections_pkey" ON "public"."sections" USING "btree" ("id");


--
-- Name: v2_access_codes_code_idx; Type: INDEX; Schema: public; Owner: postgres
--

CREATE INDEX "v2_access_codes_code_idx" ON "public"."access_codes" USING "btree" ("code");


--
-- Name: v2_study_guides_category_id_idx; Type: INDEX; Schema: public; Owner: postgres
--

CREATE INDEX "v2_study_guides_category_id_idx" ON "public"."study_guides" USING "btree" ("category_id");


--
-- Name: v2_study_guides_display_order_idx; Type: INDEX; Schema: public; Owner: postgres
--

CREATE INDEX "v2_study_guides_display_order_idx" ON "public"."study_guides" USING "btree" ("display_order");


--
-- Name: study_guide_templates set_timestamp_v2_study_guide_templates; Type: TRIGGER; Schema: public; Owner: postgres
--

CREATE OR REPLACE TRIGGER "set_timestamp_v2_study_guide_templates" BEFORE UPDATE ON "public"."study_guide_templates" FOR EACH ROW EXECUTE FUNCTION "public"."update_updated_at_column"();


--
-- Name: user_dashboards trigger_ensure_single_default_dashboard; Type: TRIGGER; Schema: public; Owner: postgres
--

CREATE OR REPLACE TRIGGER "trigger_ensure_single_default_dashboard" BEFORE INSERT OR UPDATE ON "public"."user_dashboards" FOR EACH ROW WHEN (("new"."is_default" = true)) EXECUTE FUNCTION "public"."ensure_single_default_dashboard"();


--
-- Name: media_library update_media_library_updated_at; Type: TRIGGER; Schema: public; Owner: postgres
--

CREATE OR REPLACE TRIGGER "update_media_library_updated_at" BEFORE UPDATE ON "public"."media_library" FOR EACH ROW EXECUTE FUNCTION "public"."update_updated_at_column"();


--
-- Name: user_dashboards update_user_dashboards_updated_at; Type: TRIGGER; Schema: public; Owner: postgres
--

CREATE OR REPLACE TRIGGER "update_user_dashboards_updated_at" BEFORE UPDATE ON "public"."user_dashboards" FOR EACH ROW EXECUTE FUNCTION "public"."update_updated_at_column"();


--
-- Name: user_initialization update_user_initialization_updated_at; Type: TRIGGER; Schema: public; Owner: postgres
--

CREATE OR REPLACE TRIGGER "update_user_initialization_updated_at" BEFORE UPDATE ON "public"."user_initialization" FOR EACH ROW EXECUTE FUNCTION "public"."update_updated_at_column"();


--
-- Name: user_profiles update_user_profiles_updated_at; Type: TRIGGER; Schema: public; Owner: postgres
--

CREATE OR REPLACE TRIGGER "update_user_profiles_updated_at" BEFORE UPDATE ON "public"."user_profiles" FOR EACH ROW EXECUTE FUNCTION "public"."update_updated_at_column"();


--
-- Name: categories v2_categories_updated_at_trigger; Type: TRIGGER; Schema: public; Owner: postgres
--

CREATE OR REPLACE TRIGGER "v2_categories_updated_at_trigger" BEFORE UPDATE ON "public"."categories" FOR EACH ROW EXECUTE FUNCTION "public"."update_updated_at_column"();


--
-- Name: sections v2_sections_updated_at_trigger; Type: TRIGGER; Schema: public; Owner: postgres
--

CREATE OR REPLACE TRIGGER "v2_sections_updated_at_trigger" BEFORE UPDATE ON "public"."sections" FOR EACH ROW EXECUTE FUNCTION "public"."update_updated_at_column"();


--
-- Name: study_guides v2_study_guides_updated_at_trigger; Type: TRIGGER; Schema: public; Owner: postgres
--

CREATE OR REPLACE TRIGGER "v2_study_guides_updated_at_trigger" BEFORE UPDATE ON "public"."study_guides" FOR EACH ROW EXECUTE FUNCTION "public"."update_updated_at_column"();


--
-- Name: access_codes access_codes_quiz_id_fkey; Type: FK CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY "public"."access_codes"
    ADD CONSTRAINT "access_codes_quiz_id_fkey" FOREIGN KEY ("quiz_id") REFERENCES "public"."quizzes"("id") ON DELETE CASCADE;


--
-- Name: categories categories_approved_by_fkey; Type: FK CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY "public"."categories"
    ADD CONSTRAINT "categories_approved_by_fkey" FOREIGN KEY ("approved_by") REFERENCES "auth"."users"("id");


--
-- Name: categories categories_created_by_fkey; Type: FK CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY "public"."categories"
    ADD CONSTRAINT "categories_created_by_fkey" FOREIGN KEY ("created_by") REFERENCES "auth"."users"("id");


--
-- Name: categories categories_market_id_fkey; Type: FK CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY "public"."categories"
    ADD CONSTRAINT "categories_market_id_fkey" FOREIGN KEY ("market_id") REFERENCES "public"."markets"("id");


--
-- Name: categories categories_section_id_fkey; Type: FK CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY "public"."categories"
    ADD CONSTRAINT "categories_section_id_fkey" FOREIGN KEY ("section_id") REFERENCES "public"."sections"("id") ON DELETE CASCADE;


--
-- Name: content_approval_requests content_approval_requests_requested_by_fkey; Type: FK CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY "public"."content_approval_requests"
    ADD CONSTRAINT "content_approval_requests_requested_by_fkey" FOREIGN KEY ("requested_by") REFERENCES "auth"."users"("id");


--
-- Name: content_approval_requests content_approval_requests_reviewed_by_fkey; Type: FK CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY "public"."content_approval_requests"
    ADD CONSTRAINT "content_approval_requests_reviewed_by_fkey" FOREIGN KEY ("reviewed_by") REFERENCES "auth"."users"("id");


--
-- Name: media_library media_library_approved_by_fkey; Type: FK CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY "public"."media_library"
    ADD CONSTRAINT "media_library_approved_by_fkey" FOREIGN KEY ("approved_by") REFERENCES "auth"."users"("id");


--
-- Name: media_library media_library_created_by_fkey; Type: FK CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY "public"."media_library"
    ADD CONSTRAINT "media_library_created_by_fkey" FOREIGN KEY ("created_by") REFERENCES "auth"."users"("id");


--
-- Name: media_library media_library_market_id_fkey; Type: FK CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY "public"."media_library"
    ADD CONSTRAINT "media_library_market_id_fkey" FOREIGN KEY ("market_id") REFERENCES "public"."markets"("id");


--
-- Name: media_library media_library_uploaded_by_fkey; Type: FK CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY "public"."media_library"
    ADD CONSTRAINT "media_library_uploaded_by_fkey" FOREIGN KEY ("uploaded_by") REFERENCES "auth"."users"("id") ON DELETE SET NULL;


--
-- Name: questions questions_approved_by_fkey; Type: FK CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY "public"."questions"
    ADD CONSTRAINT "questions_approved_by_fkey" FOREIGN KEY ("approved_by") REFERENCES "auth"."users"("id");


--
-- Name: questions questions_category_id_fkey; Type: FK CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY "public"."questions"
    ADD CONSTRAINT "questions_category_id_fkey" FOREIGN KEY ("category_id") REFERENCES "public"."categories"("id") ON DELETE CASCADE;


--
-- Name: questions questions_created_by_fkey; Type: FK CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY "public"."questions"
    ADD CONSTRAINT "questions_created_by_fkey" FOREIGN KEY ("created_by") REFERENCES "auth"."users"("id");


--
-- Name: questions questions_market_id_fkey; Type: FK CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY "public"."questions"
    ADD CONSTRAINT "questions_market_id_fkey" FOREIGN KEY ("market_id") REFERENCES "public"."markets"("id");


--
-- Name: quiz_questions quiz_questions_question_id_fkey; Type: FK CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY "public"."quiz_questions"
    ADD CONSTRAINT "quiz_questions_question_id_fkey" FOREIGN KEY ("question_id") REFERENCES "public"."questions"("id") ON DELETE CASCADE;


--
-- Name: quiz_questions quiz_questions_quiz_id_fkey; Type: FK CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY "public"."quiz_questions"
    ADD CONSTRAINT "quiz_questions_quiz_id_fkey" FOREIGN KEY ("quiz_id") REFERENCES "public"."quizzes"("id") ON DELETE CASCADE;


--
-- Name: quizzes quizzes_approved_by_fkey; Type: FK CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY "public"."quizzes"
    ADD CONSTRAINT "quizzes_approved_by_fkey" FOREIGN KEY ("approved_by") REFERENCES "auth"."users"("id");


--
-- Name: quizzes quizzes_created_by_fkey; Type: FK CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY "public"."quizzes"
    ADD CONSTRAINT "quizzes_created_by_fkey" FOREIGN KEY ("created_by") REFERENCES "auth"."users"("id");


--
-- Name: quizzes quizzes_market_id_fkey; Type: FK CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY "public"."quizzes"
    ADD CONSTRAINT "quizzes_market_id_fkey" FOREIGN KEY ("market_id") REFERENCES "public"."markets"("id");


--
-- Name: sections sections_approved_by_fkey; Type: FK CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY "public"."sections"
    ADD CONSTRAINT "sections_approved_by_fkey" FOREIGN KEY ("approved_by") REFERENCES "auth"."users"("id");


--
-- Name: sections sections_created_by_fkey; Type: FK CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY "public"."sections"
    ADD CONSTRAINT "sections_created_by_fkey" FOREIGN KEY ("created_by") REFERENCES "auth"."users"("id");


--
-- Name: sections sections_market_id_fkey; Type: FK CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY "public"."sections"
    ADD CONSTRAINT "sections_market_id_fkey" FOREIGN KEY ("market_id") REFERENCES "public"."markets"("id");


--
-- Name: study_guides study_guides_approved_by_fkey; Type: FK CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY "public"."study_guides"
    ADD CONSTRAINT "study_guides_approved_by_fkey" FOREIGN KEY ("approved_by") REFERENCES "auth"."users"("id");


--
-- Name: study_guides study_guides_category_id_fkey; Type: FK CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY "public"."study_guides"
    ADD CONSTRAINT "study_guides_category_id_fkey" FOREIGN KEY ("category_id") REFERENCES "public"."categories"("id") ON DELETE CASCADE;


--
-- Name: study_guides study_guides_created_by_fkey; Type: FK CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY "public"."study_guides"
    ADD CONSTRAINT "study_guides_created_by_fkey" FOREIGN KEY ("created_by") REFERENCES "auth"."users"("id");


--
-- Name: study_guides study_guides_linked_quiz_id_fkey; Type: FK CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY "public"."study_guides"
    ADD CONSTRAINT "study_guides_linked_quiz_id_fkey" FOREIGN KEY ("linked_quiz_id") REFERENCES "public"."quizzes"("id") ON DELETE SET NULL;


--
-- Name: study_guides study_guides_market_id_fkey; Type: FK CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY "public"."study_guides"
    ADD CONSTRAINT "study_guides_market_id_fkey" FOREIGN KEY ("market_id") REFERENCES "public"."markets"("id");


--
-- Name: supervisors supervisors_market_id_fkey; Type: FK CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY "public"."supervisors"
    ADD CONSTRAINT "supervisors_market_id_fkey" FOREIGN KEY ("market_id") REFERENCES "public"."markets"("id") ON DELETE SET NULL;


--
-- Name: supervisors supervisors_user_id_fkey; Type: FK CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY "public"."supervisors"
    ADD CONSTRAINT "supervisors_user_id_fkey" FOREIGN KEY ("user_id") REFERENCES "auth"."users"("id");


--
-- Name: user_dashboards user_dashboards_user_id_fkey; Type: FK CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY "public"."user_dashboards"
    ADD CONSTRAINT "user_dashboards_user_id_fkey" FOREIGN KEY ("user_id") REFERENCES "auth"."users"("id") ON DELETE CASCADE;


--
-- Name: user_initialization user_initialization_user_id_fkey; Type: FK CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY "public"."user_initialization"
    ADD CONSTRAINT "user_initialization_user_id_fkey" FOREIGN KEY ("user_id") REFERENCES "auth"."users"("id") ON DELETE CASCADE;


--
-- Name: user_profiles user_profiles_market_id_fkey; Type: FK CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY "public"."user_profiles"
    ADD CONSTRAINT "user_profiles_market_id_fkey" FOREIGN KEY ("market_id") REFERENCES "public"."markets"("id") ON DELETE SET NULL;


--
-- Name: user_profiles user_profiles_reports_to_user_id_fkey; Type: FK CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY "public"."user_profiles"
    ADD CONSTRAINT "user_profiles_reports_to_user_id_fkey" FOREIGN KEY ("reports_to_user_id") REFERENCES "public"."user_profiles"("user_id") ON DELETE SET NULL;


--
-- Name: user_profiles user_profiles_user_id_fkey; Type: FK CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY "public"."user_profiles"
    ADD CONSTRAINT "user_profiles_user_id_fkey" FOREIGN KEY ("user_id") REFERENCES "auth"."users"("id") ON DELETE CASCADE;


--
-- Name: user_profiles Admins can create profiles; Type: POLICY; Schema: public; Owner: postgres
--

CREATE POLICY "Admins can create profiles" ON "public"."user_profiles" FOR INSERT WITH CHECK (( SELECT "public"."is_admin"() AS "is_admin"));


--
-- Name: user_profiles Super admin can delete profiles; Type: POLICY; Schema: public; Owner: postgres
--

CREATE POLICY "Super admin can delete profiles" ON "public"."user_profiles" FOR DELETE USING (( SELECT "public"."is_super_admin"() AS "is_super_admin"));


--
-- Name: user_dashboards Users can delete their own dashboards; Type: POLICY; Schema: public; Owner: postgres
--

CREATE POLICY "Users can delete their own dashboards" ON "public"."user_dashboards" FOR DELETE USING (((( SELECT "auth"."uid"() AS "uid") = "user_id") AND ("is_template" = false)));


--
-- Name: user_dashboards Users can insert their own dashboards; Type: POLICY; Schema: public; Owner: postgres
--

CREATE POLICY "Users can insert their own dashboards" ON "public"."user_dashboards" FOR INSERT WITH CHECK (((( SELECT "auth"."uid"() AS "uid") = "user_id") AND ("is_template" = false)));


--
-- Name: user_initialization Users can insert their own initialization; Type: POLICY; Schema: public; Owner: postgres
--

CREATE POLICY "Users can insert their own initialization" ON "public"."user_initialization" FOR INSERT WITH CHECK ((( SELECT "auth"."uid"() AS "uid") = "user_id"));


--
-- Name: user_dashboards Users can update their own dashboards; Type: POLICY; Schema: public; Owner: postgres
--

CREATE POLICY "Users can update their own dashboards" ON "public"."user_dashboards" FOR UPDATE USING (((( SELECT "auth"."uid"() AS "uid") = "user_id") AND ("is_template" = false)));


--
-- Name: user_initialization Users can update their own initialization; Type: POLICY; Schema: public; Owner: postgres
--

CREATE POLICY "Users can update their own initialization" ON "public"."user_initialization" FOR UPDATE USING ((( SELECT "auth"."uid"() AS "uid") = "user_id"));


--
-- Name: user_dashboards Users can view their own dashboards; Type: POLICY; Schema: public; Owner: postgres
--

CREATE POLICY "Users can view their own dashboards" ON "public"."user_dashboards" FOR SELECT USING ((((( SELECT "auth"."uid"() AS "uid") = "user_id") AND ("is_template" = false)) OR ("is_template" = true)));


--
-- Name: user_initialization Users can view their own initialization; Type: POLICY; Schema: public; Owner: postgres
--

CREATE POLICY "Users can view their own initialization" ON "public"."user_initialization" FOR SELECT USING ((( SELECT "auth"."uid"() AS "uid") = "user_id"));


--
-- Name: access_codes; Type: ROW SECURITY; Schema: public; Owner: postgres
--

ALTER TABLE "public"."access_codes" ENABLE ROW LEVEL SECURITY;

--
-- Name: access_codes access_codes_delete_policy; Type: POLICY; Schema: public; Owner: postgres
--

CREATE POLICY "access_codes_delete_policy" ON "public"."access_codes" FOR DELETE USING (("auth"."role"() = 'authenticated'::"text"));


--
-- Name: access_codes access_codes_insert_policy; Type: POLICY; Schema: public; Owner: postgres
--

CREATE POLICY "access_codes_insert_policy" ON "public"."access_codes" FOR INSERT WITH CHECK (("auth"."role"() = 'authenticated'::"text"));


--
-- Name: access_codes access_codes_select_policy; Type: POLICY; Schema: public; Owner: postgres
--

CREATE POLICY "access_codes_select_policy" ON "public"."access_codes" FOR SELECT USING ((("auth"."role"() = 'authenticated'::"text") OR ("auth"."role"() = 'anon'::"text")));


--
-- Name: access_codes access_codes_update_policy; Type: POLICY; Schema: public; Owner: postgres
--

CREATE POLICY "access_codes_update_policy" ON "public"."access_codes" FOR UPDATE USING ((("auth"."role"() = 'authenticated'::"text") OR ("auth"."role"() = 'anon'::"text")));


--
-- Name: content_approval_requests approval_requests_delete_policy; Type: POLICY; Schema: public; Owner: postgres
--

CREATE POLICY "approval_requests_delete_policy" ON "public"."content_approval_requests" FOR DELETE USING (( SELECT "public"."is_super_admin"() AS "is_super_admin"));


--
-- Name: content_approval_requests approval_requests_insert_policy; Type: POLICY; Schema: public; Owner: postgres
--

CREATE POLICY "approval_requests_insert_policy" ON "public"."content_approval_requests" FOR INSERT WITH CHECK ((( SELECT "public"."can_create_content"() AS "can_create_content") AND ("requested_by" = ( SELECT "auth"."uid"() AS "uid"))));


--
-- Name: content_approval_requests approval_requests_select_policy; Type: POLICY; Schema: public; Owner: postgres
--

CREATE POLICY "approval_requests_select_policy" ON "public"."content_approval_requests" FOR SELECT USING ((( SELECT "public"."is_admin"() AS "is_admin") OR ("requested_by" = ( SELECT "auth"."uid"() AS "uid"))));


--
-- Name: content_approval_requests approval_requests_update_policy; Type: POLICY; Schema: public; Owner: postgres
--

CREATE POLICY "approval_requests_update_policy" ON "public"."content_approval_requests" FOR UPDATE USING (( SELECT "public"."is_admin"() AS "is_admin"));


--
-- Name: categories; Type: ROW SECURITY; Schema: public; Owner: postgres
--

ALTER TABLE "public"."categories" ENABLE ROW LEVEL SECURITY;

--
-- Name: categories categories_delete_policy; Type: POLICY; Schema: public; Owner: postgres
--

CREATE POLICY "categories_delete_policy" ON "public"."categories" FOR DELETE USING (( SELECT "public"."can_edit_content"("categories"."created_by", "categories"."market_id") AS "can_edit_content"));


--
-- Name: categories categories_insert_policy; Type: POLICY; Schema: public; Owner: postgres
--

CREATE POLICY "categories_insert_policy" ON "public"."categories" FOR INSERT WITH CHECK ((( SELECT "public"."can_create_content"() AS "can_create_content") AND ("created_by" = ( SELECT "auth"."uid"() AS "uid")) AND ((( SELECT "public"."is_admin"() AS "is_admin") AND ("is_nationwide" = true) AND ("market_id" IS NULL)) OR ((NOT ( SELECT "public"."is_admin"() AS "is_admin")) AND ("is_nationwide" = false) AND ("market_id" = ( SELECT "public"."get_user_market_id"() AS "get_user_market_id"))))));


--
-- Name: categories categories_select_policy; Type: POLICY; Schema: public; Owner: postgres
--

CREATE POLICY "categories_select_policy" ON "public"."categories" FOR SELECT USING ((("is_nationwide" = true) OR ( SELECT "public"."can_view_content"("categories"."market_id", "categories"."is_nationwide") AS "can_view_content")));


--
-- Name: POLICY "categories_select_policy" ON "categories"; Type: COMMENT; Schema: public; Owner: postgres
--

COMMENT ON POLICY "categories_select_policy" ON "public"."categories" IS 'OPTIMIZED: can_view_content() wrapped in SELECT';


--
-- Name: categories categories_update_policy; Type: POLICY; Schema: public; Owner: postgres
--

CREATE POLICY "categories_update_policy" ON "public"."categories" FOR UPDATE USING (( SELECT "public"."can_edit_content"("categories"."created_by", "categories"."market_id") AS "can_edit_content"));


--
-- Name: content_approval_requests; Type: ROW SECURITY; Schema: public; Owner: postgres
--

ALTER TABLE "public"."content_approval_requests" ENABLE ROW LEVEL SECURITY;

--
-- Name: markets; Type: ROW SECURITY; Schema: public; Owner: postgres
--

ALTER TABLE "public"."markets" ENABLE ROW LEVEL SECURITY;

--
-- Name: markets markets_delete_policy; Type: POLICY; Schema: public; Owner: postgres
--

CREATE POLICY "markets_delete_policy" ON "public"."markets" FOR DELETE USING ("public"."is_super_admin"());


--
-- Name: POLICY "markets_delete_policy" ON "markets"; Type: COMMENT; Schema: public; Owner: postgres
--

COMMENT ON POLICY "markets_delete_policy" ON "public"."markets" IS 'Only super admins can delete markets';


--
-- Name: markets markets_insert_policy; Type: POLICY; Schema: public; Owner: postgres
--

CREATE POLICY "markets_insert_policy" ON "public"."markets" FOR INSERT WITH CHECK ("public"."is_admin"());


--
-- Name: POLICY "markets_insert_policy" ON "markets"; Type: COMMENT; Schema: public; Owner: postgres
--

COMMENT ON POLICY "markets_insert_policy" ON "public"."markets" IS 'Only admins can create new markets';


--
-- Name: markets markets_select_policy; Type: POLICY; Schema: public; Owner: postgres
--

CREATE POLICY "markets_select_policy" ON "public"."markets" FOR SELECT USING (true);


--
-- Name: POLICY "markets_select_policy" ON "markets"; Type: COMMENT; Schema: public; Owner: postgres
--

COMMENT ON POLICY "markets_select_policy" ON "public"."markets" IS 'Allow public read access to markets for dropdowns and filters';


--
-- Name: markets markets_update_policy; Type: POLICY; Schema: public; Owner: postgres
--

CREATE POLICY "markets_update_policy" ON "public"."markets" FOR UPDATE USING ("public"."is_admin"());


--
-- Name: POLICY "markets_update_policy" ON "markets"; Type: COMMENT; Schema: public; Owner: postgres
--

COMMENT ON POLICY "markets_update_policy" ON "public"."markets" IS 'Only admins can update markets';


--
-- Name: media_library; Type: ROW SECURITY; Schema: public; Owner: postgres
--

ALTER TABLE "public"."media_library" ENABLE ROW LEVEL SECURITY;

--
-- Name: media_library media_library_delete_policy; Type: POLICY; Schema: public; Owner: postgres
--

CREATE POLICY "media_library_delete_policy" ON "public"."media_library" FOR DELETE USING (( SELECT "public"."can_edit_content"("media_library"."created_by", "media_library"."market_id") AS "can_edit_content"));


--
-- Name: media_library media_library_insert_policy; Type: POLICY; Schema: public; Owner: postgres
--

CREATE POLICY "media_library_insert_policy" ON "public"."media_library" FOR INSERT WITH CHECK ((( SELECT "public"."can_create_content"() AS "can_create_content") AND ("created_by" = ( SELECT "auth"."uid"() AS "uid")) AND ((( SELECT "public"."is_admin"() AS "is_admin") AND ("is_nationwide" = true) AND ("market_id" IS NULL)) OR ((NOT ( SELECT "public"."is_admin"() AS "is_admin")) AND ("is_nationwide" = false) AND ("market_id" = ( SELECT "public"."get_user_market_id"() AS "get_user_market_id"))))));


--
-- Name: media_library media_library_select_policy; Type: POLICY; Schema: public; Owner: postgres
--

CREATE POLICY "media_library_select_policy" ON "public"."media_library" FOR SELECT USING ((("is_nationwide" = true) OR ( SELECT "public"."can_view_content"("media_library"."market_id", "media_library"."is_nationwide") AS "can_view_content")));


--
-- Name: POLICY "media_library_select_policy" ON "media_library"; Type: COMMENT; Schema: public; Owner: postgres
--

COMMENT ON POLICY "media_library_select_policy" ON "public"."media_library" IS 'OPTIMIZED: can_view_content() wrapped in SELECT';


--
-- Name: media_library media_library_update_policy; Type: POLICY; Schema: public; Owner: postgres
--

CREATE POLICY "media_library_update_policy" ON "public"."media_library" FOR UPDATE USING (( SELECT "public"."can_edit_content"("media_library"."created_by", "media_library"."market_id") AS "can_edit_content"));


--
-- Name: questions; Type: ROW SECURITY; Schema: public; Owner: postgres
--

ALTER TABLE "public"."questions" ENABLE ROW LEVEL SECURITY;

--
-- Name: questions questions_delete_policy; Type: POLICY; Schema: public; Owner: postgres
--

CREATE POLICY "questions_delete_policy" ON "public"."questions" FOR DELETE USING (( SELECT "public"."can_edit_content"("questions"."created_by", "questions"."market_id") AS "can_edit_content"));


--
-- Name: questions questions_insert_policy; Type: POLICY; Schema: public; Owner: postgres
--

CREATE POLICY "questions_insert_policy" ON "public"."questions" FOR INSERT WITH CHECK ((( SELECT "public"."can_create_content"() AS "can_create_content") AND ("created_by" = ( SELECT "auth"."uid"() AS "uid")) AND ((( SELECT "public"."is_admin"() AS "is_admin") AND ("is_nationwide" = true) AND ("market_id" IS NULL)) OR ((NOT ( SELECT "public"."is_admin"() AS "is_admin")) AND ("is_nationwide" = false) AND ("market_id" = ( SELECT "public"."get_user_market_id"() AS "get_user_market_id"))))));


--
-- Name: questions questions_select_policy; Type: POLICY; Schema: public; Owner: postgres
--

CREATE POLICY "questions_select_policy" ON "public"."questions" FOR SELECT USING ((("is_nationwide" = true) OR ( SELECT "public"."can_view_content"("questions"."market_id", "questions"."is_nationwide") AS "can_view_content")));


--
-- Name: POLICY "questions_select_policy" ON "questions"; Type: COMMENT; Schema: public; Owner: postgres
--

COMMENT ON POLICY "questions_select_policy" ON "public"."questions" IS 'OPTIMIZED: can_view_content() wrapped in SELECT';


--
-- Name: questions questions_update_policy; Type: POLICY; Schema: public; Owner: postgres
--

CREATE POLICY "questions_update_policy" ON "public"."questions" FOR UPDATE USING (( SELECT "public"."can_edit_content"("questions"."created_by", "questions"."market_id") AS "can_edit_content"));


--
-- Name: quiz_questions; Type: ROW SECURITY; Schema: public; Owner: postgres
--

ALTER TABLE "public"."quiz_questions" ENABLE ROW LEVEL SECURITY;

--
-- Name: quiz_questions quiz_questions_delete_policy; Type: POLICY; Schema: public; Owner: postgres
--

CREATE POLICY "quiz_questions_delete_policy" ON "public"."quiz_questions" FOR DELETE USING (( SELECT "public"."can_create_content"() AS "can_create_content"));


--
-- Name: quiz_questions quiz_questions_insert_policy; Type: POLICY; Schema: public; Owner: postgres
--

CREATE POLICY "quiz_questions_insert_policy" ON "public"."quiz_questions" FOR INSERT WITH CHECK (( SELECT "public"."can_create_content"() AS "can_create_content"));


--
-- Name: quiz_questions quiz_questions_select_policy; Type: POLICY; Schema: public; Owner: postgres
--

CREATE POLICY "quiz_questions_select_policy" ON "public"."quiz_questions" FOR SELECT USING (true);


--
-- Name: quiz_questions quiz_questions_update_policy; Type: POLICY; Schema: public; Owner: postgres
--

CREATE POLICY "quiz_questions_update_policy" ON "public"."quiz_questions" FOR UPDATE USING (( SELECT "public"."can_create_content"() AS "can_create_content"));


--
-- Name: quiz_results; Type: ROW SECURITY; Schema: public; Owner: postgres
--

ALTER TABLE "public"."quiz_results" ENABLE ROW LEVEL SECURITY;

--
-- Name: quiz_results quiz_results_insert_policy; Type: POLICY; Schema: public; Owner: postgres
--

CREATE POLICY "quiz_results_insert_policy" ON "public"."quiz_results" FOR INSERT WITH CHECK (true);


--
-- Name: POLICY "quiz_results_insert_policy" ON "quiz_results"; Type: COMMENT; Schema: public; Owner: postgres
--

COMMENT ON POLICY "quiz_results_insert_policy" ON "public"."quiz_results" IS 'Allow anyone to submit quiz results (unauthenticated quiz takers)';


--
-- Name: quiz_results quiz_results_select_policy; Type: POLICY; Schema: public; Owner: postgres
--

CREATE POLICY "quiz_results_select_policy" ON "public"."quiz_results" FOR SELECT USING ((( SELECT "public"."is_admin"() AS "is_admin") OR ((( SELECT "public"."get_user_role"() AS "get_user_role") = ANY (ARRAY['aom'::"public"."user_role", 'supervisor'::"public"."user_role", 'lead_tech'::"public"."user_role"])) AND ("market" = (( SELECT "markets"."name"
   FROM "public"."markets"
  WHERE ("markets"."id" = ( SELECT "public"."get_user_market_id"() AS "get_user_market_id"))))::"text")) OR ((( SELECT "public"."get_user_role"() AS "get_user_role") = 'technician'::"public"."user_role") AND ("market" = (( SELECT "markets"."name"
   FROM "public"."markets"
  WHERE ("markets"."id" = ( SELECT "public"."get_user_market_id"() AS "get_user_market_id"))))::"text"))));


--
-- Name: POLICY "quiz_results_select_policy" ON "quiz_results"; Type: COMMENT; Schema: public; Owner: postgres
--

COMMENT ON POLICY "quiz_results_select_policy" ON "public"."quiz_results" IS 'FIX: Allow Lead Techs and Technicians to view quiz results from their market - was incorrectly restricted to only AOM/Supervisor';


--
-- Name: quizzes; Type: ROW SECURITY; Schema: public; Owner: postgres
--

ALTER TABLE "public"."quizzes" ENABLE ROW LEVEL SECURITY;

--
-- Name: quizzes quizzes_delete_policy; Type: POLICY; Schema: public; Owner: postgres
--

CREATE POLICY "quizzes_delete_policy" ON "public"."quizzes" FOR DELETE USING (( SELECT "public"."can_edit_content"("quizzes"."created_by", "quizzes"."market_id") AS "can_edit_content"));


--
-- Name: quizzes quizzes_insert_policy; Type: POLICY; Schema: public; Owner: postgres
--

CREATE POLICY "quizzes_insert_policy" ON "public"."quizzes" FOR INSERT WITH CHECK ((( SELECT "public"."can_create_content"() AS "can_create_content") AND ("created_by" = ( SELECT "auth"."uid"() AS "uid")) AND ((( SELECT "public"."is_admin"() AS "is_admin") AND ("is_nationwide" = true) AND ("market_id" IS NULL)) OR ((NOT ( SELECT "public"."is_admin"() AS "is_admin")) AND ("is_nationwide" = false) AND ("market_id" = ( SELECT "public"."get_user_market_id"() AS "get_user_market_id"))))));


--
-- Name: quizzes quizzes_select_policy; Type: POLICY; Schema: public; Owner: postgres
--

CREATE POLICY "quizzes_select_policy" ON "public"."quizzes" FOR SELECT USING ((("is_nationwide" = true) OR ( SELECT "public"."can_view_content"("quizzes"."market_id", "quizzes"."is_nationwide") AS "can_view_content")));


--
-- Name: POLICY "quizzes_select_policy" ON "quizzes"; Type: COMMENT; Schema: public; Owner: postgres
--

COMMENT ON POLICY "quizzes_select_policy" ON "public"."quizzes" IS 'OPTIMIZED: can_view_content() wrapped in SELECT';


--
-- Name: quizzes quizzes_update_policy; Type: POLICY; Schema: public; Owner: postgres
--

CREATE POLICY "quizzes_update_policy" ON "public"."quizzes" FOR UPDATE USING (( SELECT "public"."can_edit_content"("quizzes"."created_by", "quizzes"."market_id") AS "can_edit_content"));


--
-- Name: sections; Type: ROW SECURITY; Schema: public; Owner: postgres
--

ALTER TABLE "public"."sections" ENABLE ROW LEVEL SECURITY;

--
-- Name: sections sections_delete_policy; Type: POLICY; Schema: public; Owner: postgres
--

CREATE POLICY "sections_delete_policy" ON "public"."sections" FOR DELETE USING (( SELECT "public"."can_edit_content"("sections"."created_by", "sections"."market_id") AS "can_edit_content"));


--
-- Name: sections sections_insert_policy; Type: POLICY; Schema: public; Owner: postgres
--

CREATE POLICY "sections_insert_policy" ON "public"."sections" FOR INSERT WITH CHECK ((( SELECT "public"."can_create_content"() AS "can_create_content") AND ("created_by" = ( SELECT "auth"."uid"() AS "uid")) AND ((( SELECT "public"."is_admin"() AS "is_admin") AND ("is_nationwide" = true) AND ("market_id" IS NULL)) OR ((NOT ( SELECT "public"."is_admin"() AS "is_admin")) AND ("is_nationwide" = false) AND ("market_id" = ( SELECT "public"."get_user_market_id"() AS "get_user_market_id"))))));


--
-- Name: sections sections_select_policy; Type: POLICY; Schema: public; Owner: postgres
--

CREATE POLICY "sections_select_policy" ON "public"."sections" FOR SELECT USING ((("is_nationwide" = true) OR ( SELECT "public"."can_view_content"("sections"."market_id", "sections"."is_nationwide") AS "can_view_content")));


--
-- Name: POLICY "sections_select_policy" ON "sections"; Type: COMMENT; Schema: public; Owner: postgres
--

COMMENT ON POLICY "sections_select_policy" ON "public"."sections" IS 'OPTIMIZED: can_view_content() wrapped in SELECT';


--
-- Name: sections sections_update_policy; Type: POLICY; Schema: public; Owner: postgres
--

CREATE POLICY "sections_update_policy" ON "public"."sections" FOR UPDATE USING (( SELECT "public"."can_edit_content"("sections"."created_by", "sections"."market_id") AS "can_edit_content"));


--
-- Name: study_guide_templates; Type: ROW SECURITY; Schema: public; Owner: postgres
--

ALTER TABLE "public"."study_guide_templates" ENABLE ROW LEVEL SECURITY;

--
-- Name: study_guide_templates study_guide_templates_delete_policy; Type: POLICY; Schema: public; Owner: postgres
--

CREATE POLICY "study_guide_templates_delete_policy" ON "public"."study_guide_templates" FOR DELETE USING ((( SELECT "auth"."role"() AS "role") = 'authenticated'::"text"));


--
-- Name: study_guide_templates study_guide_templates_insert_policy; Type: POLICY; Schema: public; Owner: postgres
--

CREATE POLICY "study_guide_templates_insert_policy" ON "public"."study_guide_templates" FOR INSERT WITH CHECK ((( SELECT "auth"."role"() AS "role") = 'authenticated'::"text"));


--
-- Name: study_guide_templates study_guide_templates_select_policy; Type: POLICY; Schema: public; Owner: postgres
--

CREATE POLICY "study_guide_templates_select_policy" ON "public"."study_guide_templates" FOR SELECT USING (true);


--
-- Name: study_guide_templates study_guide_templates_update_policy; Type: POLICY; Schema: public; Owner: postgres
--

CREATE POLICY "study_guide_templates_update_policy" ON "public"."study_guide_templates" FOR UPDATE USING ((( SELECT "auth"."role"() AS "role") = 'authenticated'::"text"));


--
-- Name: study_guides; Type: ROW SECURITY; Schema: public; Owner: postgres
--

ALTER TABLE "public"."study_guides" ENABLE ROW LEVEL SECURITY;

--
-- Name: study_guides study_guides_delete_policy; Type: POLICY; Schema: public; Owner: postgres
--

CREATE POLICY "study_guides_delete_policy" ON "public"."study_guides" FOR DELETE USING (( SELECT "public"."can_edit_content"("study_guides"."created_by", "study_guides"."market_id") AS "can_edit_content"));


--
-- Name: study_guides study_guides_insert_policy; Type: POLICY; Schema: public; Owner: postgres
--

CREATE POLICY "study_guides_insert_policy" ON "public"."study_guides" FOR INSERT WITH CHECK ((( SELECT "public"."can_create_content"() AS "can_create_content") AND ("created_by" = ( SELECT "auth"."uid"() AS "uid")) AND ((( SELECT "public"."is_admin"() AS "is_admin") AND ("is_nationwide" = true) AND ("market_id" IS NULL)) OR ((NOT ( SELECT "public"."is_admin"() AS "is_admin")) AND ("is_nationwide" = false) AND ("market_id" = ( SELECT "public"."get_user_market_id"() AS "get_user_market_id"))))));


--
-- Name: study_guides study_guides_select_policy; Type: POLICY; Schema: public; Owner: postgres
--

CREATE POLICY "study_guides_select_policy" ON "public"."study_guides" FOR SELECT USING ((("is_nationwide" = true) OR ( SELECT "public"."can_view_content"("study_guides"."market_id", "study_guides"."is_nationwide") AS "can_view_content")));


--
-- Name: POLICY "study_guides_select_policy" ON "study_guides"; Type: COMMENT; Schema: public; Owner: postgres
--

COMMENT ON POLICY "study_guides_select_policy" ON "public"."study_guides" IS 'OPTIMIZED: can_view_content() wrapped in SELECT';


--
-- Name: study_guides study_guides_update_policy; Type: POLICY; Schema: public; Owner: postgres
--

CREATE POLICY "study_guides_update_policy" ON "public"."study_guides" FOR UPDATE USING (( SELECT "public"."can_edit_content"("study_guides"."created_by", "study_guides"."market_id") AS "can_edit_content"));


--
-- Name: supervisors; Type: ROW SECURITY; Schema: public; Owner: postgres
--

ALTER TABLE "public"."supervisors" ENABLE ROW LEVEL SECURITY;

--
-- Name: supervisors supervisors_delete_policy; Type: POLICY; Schema: public; Owner: postgres
--

CREATE POLICY "supervisors_delete_policy" ON "public"."supervisors" FOR DELETE USING ("public"."is_super_admin"());


--
-- Name: POLICY "supervisors_delete_policy" ON "supervisors"; Type: COMMENT; Schema: public; Owner: postgres
--

COMMENT ON POLICY "supervisors_delete_policy" ON "public"."supervisors" IS 'Only super admins can delete supervisors';


--
-- Name: supervisors supervisors_insert_policy; Type: POLICY; Schema: public; Owner: postgres
--

CREATE POLICY "supervisors_insert_policy" ON "public"."supervisors" FOR INSERT WITH CHECK ("public"."is_admin"());


--
-- Name: POLICY "supervisors_insert_policy" ON "supervisors"; Type: COMMENT; Schema: public; Owner: postgres
--

COMMENT ON POLICY "supervisors_insert_policy" ON "public"."supervisors" IS 'Only admins can create new supervisors';


--
-- Name: supervisors supervisors_select_policy; Type: POLICY; Schema: public; Owner: postgres
--

CREATE POLICY "supervisors_select_policy" ON "public"."supervisors" FOR SELECT USING (true);


--
-- Name: POLICY "supervisors_select_policy" ON "supervisors"; Type: COMMENT; Schema: public; Owner: postgres
--

COMMENT ON POLICY "supervisors_select_policy" ON "public"."supervisors" IS 'Allow public read access to supervisors for dropdowns and filters';


--
-- Name: supervisors supervisors_update_policy; Type: POLICY; Schema: public; Owner: postgres
--

CREATE POLICY "supervisors_update_policy" ON "public"."supervisors" FOR UPDATE USING ("public"."is_admin"());


--
-- Name: POLICY "supervisors_update_policy" ON "supervisors"; Type: COMMENT; Schema: public; Owner: postgres
--

COMMENT ON POLICY "supervisors_update_policy" ON "public"."supervisors" IS 'Only admins can update supervisors';


--
-- Name: user_dashboards; Type: ROW SECURITY; Schema: public; Owner: postgres
--

ALTER TABLE "public"."user_dashboards" ENABLE ROW LEVEL SECURITY;

--
-- Name: user_initialization; Type: ROW SECURITY; Schema: public; Owner: postgres
--

ALTER TABLE "public"."user_initialization" ENABLE ROW LEVEL SECURITY;

--
-- Name: user_profiles; Type: ROW SECURITY; Schema: public; Owner: postgres
--

ALTER TABLE "public"."user_profiles" ENABLE ROW LEVEL SECURITY;

--
-- Name: user_profiles user_profiles_select_policy; Type: POLICY; Schema: public; Owner: postgres
--

CREATE POLICY "user_profiles_select_policy" ON "public"."user_profiles" FOR SELECT USING ((("user_id" = ( SELECT "auth"."uid"() AS "uid")) OR ( SELECT "public"."is_admin"() AS "is_admin") OR ((( SELECT "public"."get_user_role"() AS "get_user_role") = ANY (ARRAY['aom'::"public"."user_role", 'supervisor'::"public"."user_role"])) AND ("market_id" = ( SELECT "public"."get_user_market_id"() AS "get_user_market_id")))));


--
-- Name: POLICY "user_profiles_select_policy" ON "user_profiles"; Type: COMMENT; Schema: public; Owner: postgres
--

COMMENT ON POLICY "user_profiles_select_policy" ON "public"."user_profiles" IS 'OPTIMIZED: Single policy combining user, admin, and manager SELECT permissions';


--
-- Name: user_profiles user_profiles_update_policy; Type: POLICY; Schema: public; Owner: postgres
--

CREATE POLICY "user_profiles_update_policy" ON "public"."user_profiles" FOR UPDATE USING ((("user_id" = ( SELECT "auth"."uid"() AS "uid")) OR ( SELECT "public"."can_manage_user"("user_profiles"."user_id") AS "can_manage_user")));


--
-- Name: POLICY "user_profiles_update_policy" ON "user_profiles"; Type: COMMENT; Schema: public; Owner: postgres
--

COMMENT ON POLICY "user_profiles_update_policy" ON "public"."user_profiles" IS 'OPTIMIZED: Single policy combining user self-update and manager UPDATE permissions';


--
-- Name: supabase_realtime; Type: PUBLICATION; Schema: -; Owner: postgres
--

-- CREATE PUBLICATION "supabase_realtime" WITH (publish = 'insert, update, delete, truncate');


ALTER PUBLICATION "supabase_realtime" OWNER TO "postgres";

--
-- Name: SCHEMA "public"; Type: ACL; Schema: -; Owner: pg_database_owner
--

GRANT USAGE ON SCHEMA "public" TO "postgres";
GRANT USAGE ON SCHEMA "public" TO "anon";
GRANT USAGE ON SCHEMA "public" TO "authenticated";
GRANT USAGE ON SCHEMA "public" TO "service_role";


--
-- Name: FUNCTION "algorithm_sign"("signables" "text", "secret" "text", "algorithm" "text"); Type: ACL; Schema: extensions; Owner: supabase_admin
--

-- GRANT ALL ON FUNCTION "extensions"."algorithm_sign"("signables" "text", "secret" "text", "algorithm" "text") TO "postgres" WITH GRANT OPTION;
-- GRANT ALL ON FUNCTION "extensions"."algorithm_sign"("signables" "text", "secret" "text", "algorithm" "text") TO "dashboard_user";


--
-- Name: FUNCTION "armor"("bytea"); Type: ACL; Schema: extensions; Owner: supabase_admin
--

-- GRANT ALL ON FUNCTION "extensions"."armor"("bytea") TO "postgres" WITH GRANT OPTION;
-- GRANT ALL ON FUNCTION "extensions"."armor"("bytea") TO "dashboard_user";


--
-- Name: FUNCTION "armor"("bytea", "text"[], "text"[]); Type: ACL; Schema: extensions; Owner: supabase_admin
--

-- GRANT ALL ON FUNCTION "extensions"."armor"("bytea", "text"[], "text"[]) TO "postgres" WITH GRANT OPTION;
-- GRANT ALL ON FUNCTION "extensions"."armor"("bytea", "text"[], "text"[]) TO "dashboard_user";


--
-- Name: FUNCTION "crypt"("text", "text"); Type: ACL; Schema: extensions; Owner: supabase_admin
--

-- GRANT ALL ON FUNCTION "extensions"."crypt"("text", "text") TO "postgres" WITH GRANT OPTION;
-- GRANT ALL ON FUNCTION "extensions"."crypt"("text", "text") TO "dashboard_user";


--
-- Name: FUNCTION "dearmor"("text"); Type: ACL; Schema: extensions; Owner: supabase_admin
--

-- GRANT ALL ON FUNCTION "extensions"."dearmor"("text") TO "postgres" WITH GRANT OPTION;
-- GRANT ALL ON FUNCTION "extensions"."dearmor"("text") TO "dashboard_user";


--
-- Name: FUNCTION "decrypt"("bytea", "bytea", "text"); Type: ACL; Schema: extensions; Owner: supabase_admin
--

-- GRANT ALL ON FUNCTION "extensions"."decrypt"("bytea", "bytea", "text") TO "postgres" WITH GRANT OPTION;
-- GRANT ALL ON FUNCTION "extensions"."decrypt"("bytea", "bytea", "text") TO "dashboard_user";


--
-- Name: FUNCTION "decrypt_iv"("bytea", "bytea", "bytea", "text"); Type: ACL; Schema: extensions; Owner: supabase_admin
--

-- GRANT ALL ON FUNCTION "extensions"."decrypt_iv"("bytea", "bytea", "bytea", "text") TO "postgres" WITH GRANT OPTION;
-- GRANT ALL ON FUNCTION "extensions"."decrypt_iv"("bytea", "bytea", "bytea", "text") TO "dashboard_user";


--
-- Name: FUNCTION "digest"("bytea", "text"); Type: ACL; Schema: extensions; Owner: supabase_admin
--

-- GRANT ALL ON FUNCTION "extensions"."digest"("bytea", "text") TO "postgres" WITH GRANT OPTION;
-- GRANT ALL ON FUNCTION "extensions"."digest"("bytea", "text") TO "dashboard_user";


--
-- Name: FUNCTION "digest"("text", "text"); Type: ACL; Schema: extensions; Owner: supabase_admin
--

-- GRANT ALL ON FUNCTION "extensions"."digest"("text", "text") TO "postgres" WITH GRANT OPTION;
-- GRANT ALL ON FUNCTION "extensions"."digest"("text", "text") TO "dashboard_user";


--
-- Name: FUNCTION "encrypt"("bytea", "bytea", "text"); Type: ACL; Schema: extensions; Owner: supabase_admin
--

-- GRANT ALL ON FUNCTION "extensions"."encrypt"("bytea", "bytea", "text") TO "postgres" WITH GRANT OPTION;
-- GRANT ALL ON FUNCTION "extensions"."encrypt"("bytea", "bytea", "text") TO "dashboard_user";


--
-- Name: FUNCTION "encrypt_iv"("bytea", "bytea", "bytea", "text"); Type: ACL; Schema: extensions; Owner: supabase_admin
--

-- GRANT ALL ON FUNCTION "extensions"."encrypt_iv"("bytea", "bytea", "bytea", "text") TO "postgres" WITH GRANT OPTION;
-- GRANT ALL ON FUNCTION "extensions"."encrypt_iv"("bytea", "bytea", "bytea", "text") TO "dashboard_user";


--
-- Name: FUNCTION "gen_random_bytes"(integer); Type: ACL; Schema: extensions; Owner: supabase_admin
--

-- GRANT ALL ON FUNCTION "extensions"."gen_random_bytes"(integer) TO "postgres" WITH GRANT OPTION;
-- GRANT ALL ON FUNCTION "extensions"."gen_random_bytes"(integer) TO "dashboard_user";


--
-- Name: FUNCTION "gen_random_uuid"(); Type: ACL; Schema: extensions; Owner: supabase_admin
--

-- GRANT ALL ON FUNCTION "extensions"."gen_random_uuid"() TO "postgres" WITH GRANT OPTION;
-- GRANT ALL ON FUNCTION "extensions"."gen_random_uuid"() TO "dashboard_user";


--
-- Name: FUNCTION "gen_salt"("text"); Type: ACL; Schema: extensions; Owner: supabase_admin
--

-- GRANT ALL ON FUNCTION "extensions"."gen_salt"("text") TO "postgres" WITH GRANT OPTION;
-- GRANT ALL ON FUNCTION "extensions"."gen_salt"("text") TO "dashboard_user";


--
-- Name: FUNCTION "gen_salt"("text", integer); Type: ACL; Schema: extensions; Owner: supabase_admin
--

-- GRANT ALL ON FUNCTION "extensions"."gen_salt"("text", integer) TO "postgres" WITH GRANT OPTION;
-- GRANT ALL ON FUNCTION "extensions"."gen_salt"("text", integer) TO "dashboard_user";


--
-- Name: FUNCTION "hmac"("bytea", "bytea", "text"); Type: ACL; Schema: extensions; Owner: supabase_admin
--

-- GRANT ALL ON FUNCTION "extensions"."hmac"("bytea", "bytea", "text") TO "postgres" WITH GRANT OPTION;
-- GRANT ALL ON FUNCTION "extensions"."hmac"("bytea", "bytea", "text") TO "dashboard_user";


--
-- Name: FUNCTION "hmac"("text", "text", "text"); Type: ACL; Schema: extensions; Owner: supabase_admin
--

-- GRANT ALL ON FUNCTION "extensions"."hmac"("text", "text", "text") TO "postgres" WITH GRANT OPTION;
-- GRANT ALL ON FUNCTION "extensions"."hmac"("text", "text", "text") TO "dashboard_user";


--
-- Name: FUNCTION "hypopg"(OUT "indexname" "text", OUT "indexrelid" "oid", OUT "indrelid" "oid", OUT "innatts" integer, OUT "indisunique" boolean, OUT "indkey" "int2vector", OUT "indcollation" "oidvector", OUT "indclass" "oidvector", OUT "indoption" "oidvector", OUT "indexprs" "pg_node_tree", OUT "indpred" "pg_node_tree", OUT "amid" "oid"); Type: ACL; Schema: extensions; Owner: supabase_admin
--

-- GRANT ALL ON FUNCTION "extensions"."hypopg"(OUT "indexname" "text", OUT "indexrelid" "oid", OUT "indrelid" "oid", OUT "innatts" integer, OUT "indisunique" boolean, OUT "indkey" "int2vector", OUT "indcollation" "oidvector", OUT "indclass" "oidvector", OUT "indoption" "oidvector", OUT "indexprs" "pg_node_tree", OUT "indpred" "pg_node_tree", OUT "amid" "oid") TO "postgres" WITH GRANT OPTION;


--
-- Name: FUNCTION "hypopg_create_index"("sql_order" "text", OUT "indexrelid" "oid", OUT "indexname" "text"); Type: ACL; Schema: extensions; Owner: supabase_admin
--

-- GRANT ALL ON FUNCTION "extensions"."hypopg_create_index"("sql_order" "text", OUT "indexrelid" "oid", OUT "indexname" "text") TO "postgres" WITH GRANT OPTION;


--
-- Name: FUNCTION "hypopg_drop_index"("indexid" "oid"); Type: ACL; Schema: extensions; Owner: supabase_admin
--

-- GRANT ALL ON FUNCTION "extensions"."hypopg_drop_index"("indexid" "oid") TO "postgres" WITH GRANT OPTION;


--
-- Name: FUNCTION "hypopg_get_indexdef"("indexid" "oid"); Type: ACL; Schema: extensions; Owner: supabase_admin
--

-- GRANT ALL ON FUNCTION "extensions"."hypopg_get_indexdef"("indexid" "oid") TO "postgres" WITH GRANT OPTION;


--
-- Name: FUNCTION "hypopg_hidden_indexes"(); Type: ACL; Schema: extensions; Owner: supabase_admin
--

-- GRANT ALL ON FUNCTION "extensions"."hypopg_hidden_indexes"() TO "postgres" WITH GRANT OPTION;


--
-- Name: FUNCTION "hypopg_hide_index"("indexid" "oid"); Type: ACL; Schema: extensions; Owner: supabase_admin
--

-- GRANT ALL ON FUNCTION "extensions"."hypopg_hide_index"("indexid" "oid") TO "postgres" WITH GRANT OPTION;


--
-- Name: FUNCTION "hypopg_relation_size"("indexid" "oid"); Type: ACL; Schema: extensions; Owner: supabase_admin
--

-- GRANT ALL ON FUNCTION "extensions"."hypopg_relation_size"("indexid" "oid") TO "postgres" WITH GRANT OPTION;


--
-- Name: FUNCTION "hypopg_reset"(); Type: ACL; Schema: extensions; Owner: supabase_admin
--

-- GRANT ALL ON FUNCTION "extensions"."hypopg_reset"() TO "postgres" WITH GRANT OPTION;


--
-- Name: FUNCTION "hypopg_reset_index"(); Type: ACL; Schema: extensions; Owner: supabase_admin
--

-- GRANT ALL ON FUNCTION "extensions"."hypopg_reset_index"() TO "postgres" WITH GRANT OPTION;


--
-- Name: FUNCTION "hypopg_unhide_all_indexes"(); Type: ACL; Schema: extensions; Owner: supabase_admin
--

-- GRANT ALL ON FUNCTION "extensions"."hypopg_unhide_all_indexes"() TO "postgres" WITH GRANT OPTION;


--
-- Name: FUNCTION "hypopg_unhide_index"("indexid" "oid"); Type: ACL; Schema: extensions; Owner: supabase_admin
--

-- GRANT ALL ON FUNCTION "extensions"."hypopg_unhide_index"("indexid" "oid") TO "postgres" WITH GRANT OPTION;


--
-- Name: FUNCTION "index_advisor"("query" "text"); Type: ACL; Schema: extensions; Owner: supabase_admin
--

-- GRANT ALL ON FUNCTION "extensions"."index_advisor"("query" "text") TO "postgres" WITH GRANT OPTION;


--
-- Name: FUNCTION "pg_stat_statements"("showtext" boolean, OUT "userid" "oid", OUT "dbid" "oid", OUT "toplevel" boolean, OUT "queryid" bigint, OUT "query" "text", OUT "plans" bigint, OUT "total_plan_time" double precision, OUT "min_plan_time" double precision, OUT "max_plan_time" double precision, OUT "mean_plan_time" double precision, OUT "stddev_plan_time" double precision, OUT "calls" bigint, OUT "total_exec_time" double precision, OUT "min_exec_time" double precision, OUT "max_exec_time" double precision, OUT "mean_exec_time" double precision, OUT "stddev_exec_time" double precision, OUT "rows" bigint, OUT "shared_blks_hit" bigint, OUT "shared_blks_read" bigint, OUT "shared_blks_dirtied" bigint, OUT "shared_blks_written" bigint, OUT "local_blks_hit" bigint, OUT "local_blks_read" bigint, OUT "local_blks_dirtied" bigint, OUT "local_blks_written" bigint, OUT "temp_blks_read" bigint, OUT "temp_blks_written" bigint, OUT "blk_read_time" double precision, OUT "blk_write_time" double precision, OUT "temp_blk_read_time" double precision, OUT "temp_blk_write_time" double precision, OUT "wal_records" bigint, OUT "wal_fpi" bigint, OUT "wal_bytes" numeric, OUT "jit_functions" bigint, OUT "jit_generation_time" double precision, OUT "jit_inlining_count" bigint, OUT "jit_inlining_time" double precision, OUT "jit_optimization_count" bigint, OUT "jit_optimization_time" double precision, OUT "jit_emission_count" bigint, OUT "jit_emission_time" double precision); Type: ACL; Schema: extensions; Owner: supabase_admin
--

-- GRANT ALL ON FUNCTION "extensions"."pg_stat_statements"("showtext" boolean, OUT "userid" "oid", OUT "dbid" "oid", OUT "toplevel" boolean, OUT "queryid" bigint, OUT "query" "text", OUT "plans" bigint, OUT "total_plan_time" double precision, OUT "min_plan_time" double precision, OUT "max_plan_time" double precision, OUT "mean_plan_time" double precision, OUT "stddev_plan_time" double precision, OUT "calls" bigint, OUT "total_exec_time" double precision, OUT "min_exec_time" double precision, OUT "max_exec_time" double precision, OUT "mean_exec_time" double precision, OUT "stddev_exec_time" double precision, OUT "rows" bigint, OUT "shared_blks_hit" bigint, OUT "shared_blks_read" bigint, OUT "shared_blks_dirtied" bigint, OUT "shared_blks_written" bigint, OUT "local_blks_hit" bigint, OUT "local_blks_read" bigint, OUT "local_blks_dirtied" bigint, OUT "local_blks_written" bigint, OUT "temp_blks_read" bigint, OUT "temp_blks_written" bigint, OUT "blk_read_time" double precision, OUT "blk_write_time" double precision, OUT "temp_blk_read_time" double precision, OUT "temp_blk_write_time" double precision, OUT "wal_records" bigint, OUT "wal_fpi" bigint, OUT "wal_bytes" numeric, OUT "jit_functions" bigint, OUT "jit_generation_time" double precision, OUT "jit_inlining_count" bigint, OUT "jit_inlining_time" double precision, OUT "jit_optimization_count" bigint, OUT "jit_optimization_time" double precision, OUT "jit_emission_count" bigint, OUT "jit_emission_time" double precision) TO "postgres" WITH GRANT OPTION;
-- GRANT ALL ON FUNCTION "extensions"."pg_stat_statements"("showtext" boolean, OUT "userid" "oid", OUT "dbid" "oid", OUT "toplevel" boolean, OUT "queryid" bigint, OUT "query" "text", OUT "plans" bigint, OUT "total_plan_time" double precision, OUT "min_plan_time" double precision, OUT "max_plan_time" double precision, OUT "mean_plan_time" double precision, OUT "stddev_plan_time" double precision, OUT "calls" bigint, OUT "total_exec_time" double precision, OUT "min_exec_time" double precision, OUT "max_exec_time" double precision, OUT "mean_exec_time" double precision, OUT "stddev_exec_time" double precision, OUT "rows" bigint, OUT "shared_blks_hit" bigint, OUT "shared_blks_read" bigint, OUT "shared_blks_dirtied" bigint, OUT "shared_blks_written" bigint, OUT "local_blks_hit" bigint, OUT "local_blks_read" bigint, OUT "local_blks_dirtied" bigint, OUT "local_blks_written" bigint, OUT "temp_blks_read" bigint, OUT "temp_blks_written" bigint, OUT "blk_read_time" double precision, OUT "blk_write_time" double precision, OUT "temp_blk_read_time" double precision, OUT "temp_blk_write_time" double precision, OUT "wal_records" bigint, OUT "wal_fpi" bigint, OUT "wal_bytes" numeric, OUT "jit_functions" bigint, OUT "jit_generation_time" double precision, OUT "jit_inlining_count" bigint, OUT "jit_inlining_time" double precision, OUT "jit_optimization_count" bigint, OUT "jit_optimization_time" double precision, OUT "jit_emission_count" bigint, OUT "jit_emission_time" double precision) TO "dashboard_user";


--
-- Name: FUNCTION "pg_stat_statements_info"(OUT "dealloc" bigint, OUT "stats_reset" timestamp with time zone); Type: ACL; Schema: extensions; Owner: supabase_admin
--

-- GRANT ALL ON FUNCTION "extensions"."pg_stat_statements_info"(OUT "dealloc" bigint, OUT "stats_reset" timestamp with time zone) TO "postgres" WITH GRANT OPTION;
-- GRANT ALL ON FUNCTION "extensions"."pg_stat_statements_info"(OUT "dealloc" bigint, OUT "stats_reset" timestamp with time zone) TO "dashboard_user";


--
-- Name: FUNCTION "pg_stat_statements_reset"("userid" "oid", "dbid" "oid", "queryid" bigint); Type: ACL; Schema: extensions; Owner: supabase_admin
--

-- GRANT ALL ON FUNCTION "extensions"."pg_stat_statements_reset"("userid" "oid", "dbid" "oid", "queryid" bigint) TO "postgres" WITH GRANT OPTION;
-- GRANT ALL ON FUNCTION "extensions"."pg_stat_statements_reset"("userid" "oid", "dbid" "oid", "queryid" bigint) TO "dashboard_user";


--
-- Name: FUNCTION "pgp_armor_headers"("text", OUT "key" "text", OUT "value" "text"); Type: ACL; Schema: extensions; Owner: supabase_admin
--

-- GRANT ALL ON FUNCTION "extensions"."pgp_armor_headers"("text", OUT "key" "text", OUT "value" "text") TO "postgres" WITH GRANT OPTION;
-- GRANT ALL ON FUNCTION "extensions"."pgp_armor_headers"("text", OUT "key" "text", OUT "value" "text") TO "dashboard_user";


--
-- Name: FUNCTION "pgp_key_id"("bytea"); Type: ACL; Schema: extensions; Owner: supabase_admin
--

-- GRANT ALL ON FUNCTION "extensions"."pgp_key_id"("bytea") TO "postgres" WITH GRANT OPTION;
-- GRANT ALL ON FUNCTION "extensions"."pgp_key_id"("bytea") TO "dashboard_user";


--
-- Name: FUNCTION "pgp_pub_decrypt"("bytea", "bytea"); Type: ACL; Schema: extensions; Owner: supabase_admin
--

-- GRANT ALL ON FUNCTION "extensions"."pgp_pub_decrypt"("bytea", "bytea") TO "postgres" WITH GRANT OPTION;
-- GRANT ALL ON FUNCTION "extensions"."pgp_pub_decrypt"("bytea", "bytea") TO "dashboard_user";


--
-- Name: FUNCTION "pgp_pub_decrypt"("bytea", "bytea", "text"); Type: ACL; Schema: extensions; Owner: supabase_admin
--

-- GRANT ALL ON FUNCTION "extensions"."pgp_pub_decrypt"("bytea", "bytea", "text") TO "postgres" WITH GRANT OPTION;
-- GRANT ALL ON FUNCTION "extensions"."pgp_pub_decrypt"("bytea", "bytea", "text") TO "dashboard_user";


--
-- Name: FUNCTION "pgp_pub_decrypt"("bytea", "bytea", "text", "text"); Type: ACL; Schema: extensions; Owner: supabase_admin
--

-- GRANT ALL ON FUNCTION "extensions"."pgp_pub_decrypt"("bytea", "bytea", "text", "text") TO "postgres" WITH GRANT OPTION;
-- GRANT ALL ON FUNCTION "extensions"."pgp_pub_decrypt"("bytea", "bytea", "text", "text") TO "dashboard_user";


--
-- Name: FUNCTION "pgp_pub_decrypt_bytea"("bytea", "bytea"); Type: ACL; Schema: extensions; Owner: supabase_admin
--

-- GRANT ALL ON FUNCTION "extensions"."pgp_pub_decrypt_bytea"("bytea", "bytea") TO "postgres" WITH GRANT OPTION;
-- GRANT ALL ON FUNCTION "extensions"."pgp_pub_decrypt_bytea"("bytea", "bytea") TO "dashboard_user";


--
-- Name: FUNCTION "pgp_pub_decrypt_bytea"("bytea", "bytea", "text"); Type: ACL; Schema: extensions; Owner: supabase_admin
--

-- GRANT ALL ON FUNCTION "extensions"."pgp_pub_decrypt_bytea"("bytea", "bytea", "text") TO "postgres" WITH GRANT OPTION;
-- GRANT ALL ON FUNCTION "extensions"."pgp_pub_decrypt_bytea"("bytea", "bytea", "text") TO "dashboard_user";


--
-- Name: FUNCTION "pgp_pub_decrypt_bytea"("bytea", "bytea", "text", "text"); Type: ACL; Schema: extensions; Owner: supabase_admin
--

-- GRANT ALL ON FUNCTION "extensions"."pgp_pub_decrypt_bytea"("bytea", "bytea", "text", "text") TO "postgres" WITH GRANT OPTION;
-- GRANT ALL ON FUNCTION "extensions"."pgp_pub_decrypt_bytea"("bytea", "bytea", "text", "text") TO "dashboard_user";


--
-- Name: FUNCTION "pgp_pub_encrypt"("text", "bytea"); Type: ACL; Schema: extensions; Owner: supabase_admin
--

-- GRANT ALL ON FUNCTION "extensions"."pgp_pub_encrypt"("text", "bytea") TO "postgres" WITH GRANT OPTION;
-- GRANT ALL ON FUNCTION "extensions"."pgp_pub_encrypt"("text", "bytea") TO "dashboard_user";


--
-- Name: FUNCTION "pgp_pub_encrypt"("text", "bytea", "text"); Type: ACL; Schema: extensions; Owner: supabase_admin
--

-- GRANT ALL ON FUNCTION "extensions"."pgp_pub_encrypt"("text", "bytea", "text") TO "postgres" WITH GRANT OPTION;
-- GRANT ALL ON FUNCTION "extensions"."pgp_pub_encrypt"("text", "bytea", "text") TO "dashboard_user";


--
-- Name: FUNCTION "pgp_pub_encrypt_bytea"("bytea", "bytea"); Type: ACL; Schema: extensions; Owner: supabase_admin
--

-- GRANT ALL ON FUNCTION "extensions"."pgp_pub_encrypt_bytea"("bytea", "bytea") TO "postgres" WITH GRANT OPTION;
-- GRANT ALL ON FUNCTION "extensions"."pgp_pub_encrypt_bytea"("bytea", "bytea") TO "dashboard_user";


--
-- Name: FUNCTION "pgp_pub_encrypt_bytea"("bytea", "bytea", "text"); Type: ACL; Schema: extensions; Owner: supabase_admin
--

-- GRANT ALL ON FUNCTION "extensions"."pgp_pub_encrypt_bytea"("bytea", "bytea", "text") TO "postgres" WITH GRANT OPTION;
-- GRANT ALL ON FUNCTION "extensions"."pgp_pub_encrypt_bytea"("bytea", "bytea", "text") TO "dashboard_user";


--
-- Name: FUNCTION "pgp_sym_decrypt"("bytea", "text"); Type: ACL; Schema: extensions; Owner: supabase_admin
--

-- GRANT ALL ON FUNCTION "extensions"."pgp_sym_decrypt"("bytea", "text") TO "postgres" WITH GRANT OPTION;
-- GRANT ALL ON FUNCTION "extensions"."pgp_sym_decrypt"("bytea", "text") TO "dashboard_user";


--
-- Name: FUNCTION "pgp_sym_decrypt"("bytea", "text", "text"); Type: ACL; Schema: extensions; Owner: supabase_admin
--

-- GRANT ALL ON FUNCTION "extensions"."pgp_sym_decrypt"("bytea", "text", "text") TO "postgres" WITH GRANT OPTION;
-- GRANT ALL ON FUNCTION "extensions"."pgp_sym_decrypt"("bytea", "text", "text") TO "dashboard_user";


--
-- Name: FUNCTION "pgp_sym_decrypt_bytea"("bytea", "text"); Type: ACL; Schema: extensions; Owner: supabase_admin
--

-- GRANT ALL ON FUNCTION "extensions"."pgp_sym_decrypt_bytea"("bytea", "text") TO "postgres" WITH GRANT OPTION;
-- GRANT ALL ON FUNCTION "extensions"."pgp_sym_decrypt_bytea"("bytea", "text") TO "dashboard_user";


--
-- Name: FUNCTION "pgp_sym_decrypt_bytea"("bytea", "text", "text"); Type: ACL; Schema: extensions; Owner: supabase_admin
--

-- GRANT ALL ON FUNCTION "extensions"."pgp_sym_decrypt_bytea"("bytea", "text", "text") TO "postgres" WITH GRANT OPTION;
-- GRANT ALL ON FUNCTION "extensions"."pgp_sym_decrypt_bytea"("bytea", "text", "text") TO "dashboard_user";


--
-- Name: FUNCTION "pgp_sym_encrypt"("text", "text"); Type: ACL; Schema: extensions; Owner: supabase_admin
--

-- GRANT ALL ON FUNCTION "extensions"."pgp_sym_encrypt"("text", "text") TO "postgres" WITH GRANT OPTION;
-- GRANT ALL ON FUNCTION "extensions"."pgp_sym_encrypt"("text", "text") TO "dashboard_user";


--
-- Name: FUNCTION "pgp_sym_encrypt"("text", "text", "text"); Type: ACL; Schema: extensions; Owner: supabase_admin
--

-- GRANT ALL ON FUNCTION "extensions"."pgp_sym_encrypt"("text", "text", "text") TO "postgres" WITH GRANT OPTION;
-- GRANT ALL ON FUNCTION "extensions"."pgp_sym_encrypt"("text", "text", "text") TO "dashboard_user";


--
-- Name: FUNCTION "pgp_sym_encrypt_bytea"("bytea", "text"); Type: ACL; Schema: extensions; Owner: supabase_admin
--

-- GRANT ALL ON FUNCTION "extensions"."pgp_sym_encrypt_bytea"("bytea", "text") TO "postgres" WITH GRANT OPTION;
-- GRANT ALL ON FUNCTION "extensions"."pgp_sym_encrypt_bytea"("bytea", "text") TO "dashboard_user";


--
-- Name: FUNCTION "pgp_sym_encrypt_bytea"("bytea", "text", "text"); Type: ACL; Schema: extensions; Owner: supabase_admin
--

-- GRANT ALL ON FUNCTION "extensions"."pgp_sym_encrypt_bytea"("bytea", "text", "text") TO "postgres" WITH GRANT OPTION;
-- GRANT ALL ON FUNCTION "extensions"."pgp_sym_encrypt_bytea"("bytea", "text", "text") TO "dashboard_user";


--
-- Name: FUNCTION "sign"("payload" "json", "secret" "text", "algorithm" "text"); Type: ACL; Schema: extensions; Owner: supabase_admin
--

-- GRANT ALL ON FUNCTION "extensions"."sign"("payload" "json", "secret" "text", "algorithm" "text") TO "postgres" WITH GRANT OPTION;
-- GRANT ALL ON FUNCTION "extensions"."sign"("payload" "json", "secret" "text", "algorithm" "text") TO "dashboard_user";


--
-- Name: FUNCTION "try_cast_double"("inp" "text"); Type: ACL; Schema: extensions; Owner: supabase_admin
--

-- GRANT ALL ON FUNCTION "extensions"."try_cast_double"("inp" "text") TO "postgres" WITH GRANT OPTION;
-- GRANT ALL ON FUNCTION "extensions"."try_cast_double"("inp" "text") TO "dashboard_user";


--
-- Name: FUNCTION "url_decode"("data" "text"); Type: ACL; Schema: extensions; Owner: supabase_admin
--

-- GRANT ALL ON FUNCTION "extensions"."url_decode"("data" "text") TO "postgres" WITH GRANT OPTION;
-- GRANT ALL ON FUNCTION "extensions"."url_decode"("data" "text") TO "dashboard_user";


--
-- Name: FUNCTION "url_encode"("data" "bytea"); Type: ACL; Schema: extensions; Owner: supabase_admin
--

-- GRANT ALL ON FUNCTION "extensions"."url_encode"("data" "bytea") TO "postgres" WITH GRANT OPTION;
-- GRANT ALL ON FUNCTION "extensions"."url_encode"("data" "bytea") TO "dashboard_user";


--
-- Name: FUNCTION "uuid_generate_v1"(); Type: ACL; Schema: extensions; Owner: supabase_admin
--

-- GRANT ALL ON FUNCTION "extensions"."uuid_generate_v1"() TO "postgres" WITH GRANT OPTION;
-- GRANT ALL ON FUNCTION "extensions"."uuid_generate_v1"() TO "dashboard_user";


--
-- Name: FUNCTION "uuid_generate_v1mc"(); Type: ACL; Schema: extensions; Owner: supabase_admin
--

-- GRANT ALL ON FUNCTION "extensions"."uuid_generate_v1mc"() TO "postgres" WITH GRANT OPTION;
-- GRANT ALL ON FUNCTION "extensions"."uuid_generate_v1mc"() TO "dashboard_user";


--
-- Name: FUNCTION "uuid_generate_v3"("namespace" "uuid", "name" "text"); Type: ACL; Schema: extensions; Owner: supabase_admin
--

-- GRANT ALL ON FUNCTION "extensions"."uuid_generate_v3"("namespace" "uuid", "name" "text") TO "postgres" WITH GRANT OPTION;
-- GRANT ALL ON FUNCTION "extensions"."uuid_generate_v3"("namespace" "uuid", "name" "text") TO "dashboard_user";


--
-- Name: FUNCTION "uuid_generate_v4"(); Type: ACL; Schema: extensions; Owner: supabase_admin
--

-- GRANT ALL ON FUNCTION "extensions"."uuid_generate_v4"() TO "postgres" WITH GRANT OPTION;
-- GRANT ALL ON FUNCTION "extensions"."uuid_generate_v4"() TO "dashboard_user";


--
-- Name: FUNCTION "uuid_generate_v5"("namespace" "uuid", "name" "text"); Type: ACL; Schema: extensions; Owner: supabase_admin
--

-- GRANT ALL ON FUNCTION "extensions"."uuid_generate_v5"("namespace" "uuid", "name" "text") TO "postgres" WITH GRANT OPTION;
-- GRANT ALL ON FUNCTION "extensions"."uuid_generate_v5"("namespace" "uuid", "name" "text") TO "dashboard_user";


--
-- Name: FUNCTION "uuid_nil"(); Type: ACL; Schema: extensions; Owner: supabase_admin
--

-- GRANT ALL ON FUNCTION "extensions"."uuid_nil"() TO "postgres" WITH GRANT OPTION;
-- GRANT ALL ON FUNCTION "extensions"."uuid_nil"() TO "dashboard_user";


--
-- Name: FUNCTION "uuid_ns_dns"(); Type: ACL; Schema: extensions; Owner: supabase_admin
--

-- GRANT ALL ON FUNCTION "extensions"."uuid_ns_dns"() TO "postgres" WITH GRANT OPTION;
-- GRANT ALL ON FUNCTION "extensions"."uuid_ns_dns"() TO "dashboard_user";


--
-- Name: FUNCTION "uuid_ns_oid"(); Type: ACL; Schema: extensions; Owner: supabase_admin
--

-- GRANT ALL ON FUNCTION "extensions"."uuid_ns_oid"() TO "postgres" WITH GRANT OPTION;
-- GRANT ALL ON FUNCTION "extensions"."uuid_ns_oid"() TO "dashboard_user";


--
-- Name: FUNCTION "uuid_ns_url"(); Type: ACL; Schema: extensions; Owner: supabase_admin
--

-- GRANT ALL ON FUNCTION "extensions"."uuid_ns_url"() TO "postgres" WITH GRANT OPTION;
-- GRANT ALL ON FUNCTION "extensions"."uuid_ns_url"() TO "dashboard_user";


--
-- Name: FUNCTION "uuid_ns_x500"(); Type: ACL; Schema: extensions; Owner: supabase_admin
--

-- GRANT ALL ON FUNCTION "extensions"."uuid_ns_x500"() TO "postgres" WITH GRANT OPTION;
-- GRANT ALL ON FUNCTION "extensions"."uuid_ns_x500"() TO "dashboard_user";


--
-- Name: FUNCTION "verify"("token" "text", "secret" "text", "algorithm" "text"); Type: ACL; Schema: extensions; Owner: supabase_admin
--

-- GRANT ALL ON FUNCTION "extensions"."verify"("token" "text", "secret" "text", "algorithm" "text") TO "postgres" WITH GRANT OPTION;
-- GRANT ALL ON FUNCTION "extensions"."verify"("token" "text", "secret" "text", "algorithm" "text") TO "dashboard_user";


--
-- Name: FUNCTION "crypto_aead_det_decrypt"("message" "bytea", "additional" "bytea", "key_uuid" "uuid", "nonce" "bytea"); Type: ACL; Schema: pgsodium; Owner: pgsodium_keymaker
--

-- GRANT ALL ON FUNCTION "pgsodium"."crypto_aead_det_decrypt"("message" "bytea", "additional" "bytea", "key_uuid" "uuid", "nonce" "bytea") TO "service_role";


--
-- Name: FUNCTION "crypto_aead_det_encrypt"("message" "bytea", "additional" "bytea", "key_uuid" "uuid", "nonce" "bytea"); Type: ACL; Schema: pgsodium; Owner: pgsodium_keymaker
--

-- GRANT ALL ON FUNCTION "pgsodium"."crypto_aead_det_encrypt"("message" "bytea", "additional" "bytea", "key_uuid" "uuid", "nonce" "bytea") TO "service_role";


--
-- Name: FUNCTION "crypto_aead_det_keygen"(); Type: ACL; Schema: pgsodium; Owner: supabase_admin
--

-- GRANT ALL ON FUNCTION "pgsodium"."crypto_aead_det_keygen"() TO "service_role";


--
-- Name: FUNCTION "admin_create_user"("p_email" "text", "p_password" "text", "p_display_name" "text", "p_role" "text", "p_market_id" integer, "p_reports_to_user_id" "uuid"); Type: ACL; Schema: public; Owner: postgres
--

GRANT ALL ON FUNCTION "public"."admin_create_user"("p_email" "text", "p_password" "text", "p_display_name" "text", "p_role" "text", "p_market_id" integer, "p_reports_to_user_id" "uuid") TO "anon";
GRANT ALL ON FUNCTION "public"."admin_create_user"("p_email" "text", "p_password" "text", "p_display_name" "text", "p_role" "text", "p_market_id" integer, "p_reports_to_user_id" "uuid") TO "authenticated";
GRANT ALL ON FUNCTION "public"."admin_create_user"("p_email" "text", "p_password" "text", "p_display_name" "text", "p_role" "text", "p_market_id" integer, "p_reports_to_user_id" "uuid") TO "service_role";


--
-- Name: FUNCTION "can_create_content"(); Type: ACL; Schema: public; Owner: postgres
--

GRANT ALL ON FUNCTION "public"."can_create_content"() TO "anon";
GRANT ALL ON FUNCTION "public"."can_create_content"() TO "authenticated";
GRANT ALL ON FUNCTION "public"."can_create_content"() TO "service_role";


--
-- Name: FUNCTION "can_edit_content"("content_created_by" "uuid", "content_market_id" integer); Type: ACL; Schema: public; Owner: postgres
--

GRANT ALL ON FUNCTION "public"."can_edit_content"("content_created_by" "uuid", "content_market_id" integer) TO "anon";
GRANT ALL ON FUNCTION "public"."can_edit_content"("content_created_by" "uuid", "content_market_id" integer) TO "authenticated";
GRANT ALL ON FUNCTION "public"."can_edit_content"("content_created_by" "uuid", "content_market_id" integer) TO "service_role";


--
-- Name: FUNCTION "can_manage_user"("target_user_id" "uuid"); Type: ACL; Schema: public; Owner: postgres
--

GRANT ALL ON FUNCTION "public"."can_manage_user"("target_user_id" "uuid") TO "anon";
GRANT ALL ON FUNCTION "public"."can_manage_user"("target_user_id" "uuid") TO "authenticated";
GRANT ALL ON FUNCTION "public"."can_manage_user"("target_user_id" "uuid") TO "service_role";


--
-- Name: FUNCTION "can_view_content"("content_market_id" integer, "content_is_nationwide" boolean); Type: ACL; Schema: public; Owner: postgres
--

GRANT ALL ON FUNCTION "public"."can_view_content"("content_market_id" integer, "content_is_nationwide" boolean) TO "anon";
GRANT ALL ON FUNCTION "public"."can_view_content"("content_market_id" integer, "content_is_nationwide" boolean) TO "authenticated";
GRANT ALL ON FUNCTION "public"."can_view_content"("content_market_id" integer, "content_is_nationwide" boolean) TO "service_role";


--
-- Name: FUNCTION "ensure_single_default_configuration"(); Type: ACL; Schema: public; Owner: postgres
--

GRANT ALL ON FUNCTION "public"."ensure_single_default_configuration"() TO "anon";
GRANT ALL ON FUNCTION "public"."ensure_single_default_configuration"() TO "authenticated";
GRANT ALL ON FUNCTION "public"."ensure_single_default_configuration"() TO "service_role";


--
-- Name: FUNCTION "ensure_single_default_dashboard"(); Type: ACL; Schema: public; Owner: postgres
--

GRANT ALL ON FUNCTION "public"."ensure_single_default_dashboard"() TO "anon";
GRANT ALL ON FUNCTION "public"."ensure_single_default_dashboard"() TO "authenticated";
GRANT ALL ON FUNCTION "public"."ensure_single_default_dashboard"() TO "service_role";


--
-- Name: FUNCTION "ensure_single_default_layout"(); Type: ACL; Schema: public; Owner: postgres
--

GRANT ALL ON FUNCTION "public"."ensure_single_default_layout"() TO "anon";
GRANT ALL ON FUNCTION "public"."ensure_single_default_layout"() TO "authenticated";
GRANT ALL ON FUNCTION "public"."ensure_single_default_layout"() TO "service_role";


--
-- Name: FUNCTION "get_user_market_id"(); Type: ACL; Schema: public; Owner: postgres
--

GRANT ALL ON FUNCTION "public"."get_user_market_id"() TO "anon";
GRANT ALL ON FUNCTION "public"."get_user_market_id"() TO "authenticated";
GRANT ALL ON FUNCTION "public"."get_user_market_id"() TO "service_role";


--
-- Name: TABLE "user_profiles"; Type: ACL; Schema: public; Owner: postgres
--

GRANT ALL ON TABLE "public"."user_profiles" TO "anon";
GRANT ALL ON TABLE "public"."user_profiles" TO "authenticated";
GRANT ALL ON TABLE "public"."user_profiles" TO "service_role";


--
-- Name: FUNCTION "get_user_profile"(); Type: ACL; Schema: public; Owner: postgres
--

GRANT ALL ON FUNCTION "public"."get_user_profile"() TO "anon";
GRANT ALL ON FUNCTION "public"."get_user_profile"() TO "authenticated";
GRANT ALL ON FUNCTION "public"."get_user_profile"() TO "service_role";


--
-- Name: FUNCTION "get_user_role"(); Type: ACL; Schema: public; Owner: postgres
--

GRANT ALL ON FUNCTION "public"."get_user_role"() TO "anon";
GRANT ALL ON FUNCTION "public"."get_user_role"() TO "authenticated";
GRANT ALL ON FUNCTION "public"."get_user_role"() TO "service_role";


--
-- Name: FUNCTION "is_admin"(); Type: ACL; Schema: public; Owner: postgres
--

GRANT ALL ON FUNCTION "public"."is_admin"() TO "anon";
GRANT ALL ON FUNCTION "public"."is_admin"() TO "authenticated";
GRANT ALL ON FUNCTION "public"."is_admin"() TO "service_role";


--
-- Name: FUNCTION "is_super_admin"(); Type: ACL; Schema: public; Owner: postgres
--

GRANT ALL ON FUNCTION "public"."is_super_admin"() TO "anon";
GRANT ALL ON FUNCTION "public"."is_super_admin"() TO "authenticated";
GRANT ALL ON FUNCTION "public"."is_super_admin"() TO "service_role";


--
-- Name: FUNCTION "migrate_existing_users_to_simple_dashboards"(); Type: ACL; Schema: public; Owner: postgres
--

GRANT ALL ON FUNCTION "public"."migrate_existing_users_to_simple_dashboards"() TO "anon";
GRANT ALL ON FUNCTION "public"."migrate_existing_users_to_simple_dashboards"() TO "authenticated";
GRANT ALL ON FUNCTION "public"."migrate_existing_users_to_simple_dashboards"() TO "service_role";


--
-- Name: FUNCTION "trigger_set_timestamp"(); Type: ACL; Schema: public; Owner: postgres
--

GRANT ALL ON FUNCTION "public"."trigger_set_timestamp"() TO "anon";
GRANT ALL ON FUNCTION "public"."trigger_set_timestamp"() TO "authenticated";
GRANT ALL ON FUNCTION "public"."trigger_set_timestamp"() TO "service_role";


--
-- Name: FUNCTION "update_dashboard_configurations_updated_at"(); Type: ACL; Schema: public; Owner: postgres
--

GRANT ALL ON FUNCTION "public"."update_dashboard_configurations_updated_at"() TO "anon";
GRANT ALL ON FUNCTION "public"."update_dashboard_configurations_updated_at"() TO "authenticated";
GRANT ALL ON FUNCTION "public"."update_dashboard_configurations_updated_at"() TO "service_role";


--
-- Name: FUNCTION "update_dashboard_layouts_updated_at"(); Type: ACL; Schema: public; Owner: postgres
--

GRANT ALL ON FUNCTION "public"."update_dashboard_layouts_updated_at"() TO "anon";
GRANT ALL ON FUNCTION "public"."update_dashboard_layouts_updated_at"() TO "authenticated";
GRANT ALL ON FUNCTION "public"."update_dashboard_layouts_updated_at"() TO "service_role";


--
-- Name: FUNCTION "update_updated_at_column"(); Type: ACL; Schema: public; Owner: postgres
--

GRANT ALL ON FUNCTION "public"."update_updated_at_column"() TO "anon";
GRANT ALL ON FUNCTION "public"."update_updated_at_column"() TO "authenticated";
GRANT ALL ON FUNCTION "public"."update_updated_at_column"() TO "service_role";


--
-- Name: FUNCTION "_crypto_aead_det_decrypt"("message" "bytea", "additional" "bytea", "key_id" bigint, "context" "bytea", "nonce" "bytea"); Type: ACL; Schema: vault; Owner: supabase_admin
--

-- GRANT ALL ON FUNCTION "vault"."_crypto_aead_det_decrypt"("message" "bytea", "additional" "bytea", "key_id" bigint, "context" "bytea", "nonce" "bytea") TO "postgres" WITH GRANT OPTION;
-- GRANT ALL ON FUNCTION "vault"."_crypto_aead_det_decrypt"("message" "bytea", "additional" "bytea", "key_id" bigint, "context" "bytea", "nonce" "bytea") TO "service_role";


--
-- Name: FUNCTION "create_secret"("new_secret" "text", "new_name" "text", "new_description" "text", "new_key_id" "uuid"); Type: ACL; Schema: vault; Owner: supabase_admin
--

-- GRANT ALL ON FUNCTION "vault"."create_secret"("new_secret" "text", "new_name" "text", "new_description" "text", "new_key_id" "uuid") TO "postgres" WITH GRANT OPTION;
-- GRANT ALL ON FUNCTION "vault"."create_secret"("new_secret" "text", "new_name" "text", "new_description" "text", "new_key_id" "uuid") TO "service_role";


--
-- Name: FUNCTION "update_secret"("secret_id" "uuid", "new_secret" "text", "new_name" "text", "new_description" "text", "new_key_id" "uuid"); Type: ACL; Schema: vault; Owner: supabase_admin
--

-- GRANT ALL ON FUNCTION "vault"."update_secret"("secret_id" "uuid", "new_secret" "text", "new_name" "text", "new_description" "text", "new_key_id" "uuid") TO "postgres" WITH GRANT OPTION;
-- GRANT ALL ON FUNCTION "vault"."update_secret"("secret_id" "uuid", "new_secret" "text", "new_name" "text", "new_description" "text", "new_key_id" "uuid") TO "service_role";


--
-- Name: TABLE "hypopg_list_indexes"; Type: ACL; Schema: extensions; Owner: supabase_admin
--

-- GRANT ALL ON TABLE "extensions"."hypopg_list_indexes" TO "postgres" WITH GRANT OPTION;


--
-- Name: TABLE "hypopg_hidden_indexes"; Type: ACL; Schema: extensions; Owner: supabase_admin
--

-- GRANT ALL ON TABLE "extensions"."hypopg_hidden_indexes" TO "postgres" WITH GRANT OPTION;


--
-- Name: TABLE "pg_stat_statements"; Type: ACL; Schema: extensions; Owner: supabase_admin
--

-- GRANT ALL ON TABLE "extensions"."pg_stat_statements" TO "postgres" WITH GRANT OPTION;
-- GRANT ALL ON TABLE "extensions"."pg_stat_statements" TO "dashboard_user";


--
-- Name: TABLE "pg_stat_statements_info"; Type: ACL; Schema: extensions; Owner: supabase_admin
--

-- GRANT ALL ON TABLE "extensions"."pg_stat_statements_info" TO "postgres" WITH GRANT OPTION;
-- GRANT ALL ON TABLE "extensions"."pg_stat_statements_info" TO "dashboard_user";


--
-- Name: TABLE "decrypted_key"; Type: ACL; Schema: pgsodium; Owner: supabase_admin
--

-- GRANT ALL ON TABLE "pgsodium"."decrypted_key" TO "pgsodium_keyholder";


--
-- Name: TABLE "masking_rule"; Type: ACL; Schema: pgsodium; Owner: supabase_admin
--

-- GRANT ALL ON TABLE "pgsodium"."masking_rule" TO "pgsodium_keyholder";


--
-- Name: TABLE "mask_columns"; Type: ACL; Schema: pgsodium; Owner: supabase_admin
--

-- GRANT ALL ON TABLE "pgsodium"."mask_columns" TO "pgsodium_keyholder";


--
-- Name: TABLE "quiz_results"; Type: ACL; Schema: public; Owner: postgres
--

GRANT ALL ON TABLE "public"."quiz_results" TO "anon";
GRANT ALL ON TABLE "public"."quiz_results" TO "authenticated";
GRANT ALL ON TABLE "public"."quiz_results" TO "service_role";


--
-- Name: SEQUENCE "Service Tech Quiz Results_id_seq"; Type: ACL; Schema: public; Owner: postgres
--

GRANT ALL ON SEQUENCE "public"."Service Tech Quiz Results_id_seq" TO "anon";
GRANT ALL ON SEQUENCE "public"."Service Tech Quiz Results_id_seq" TO "authenticated";
GRANT ALL ON SEQUENCE "public"."Service Tech Quiz Results_id_seq" TO "service_role";


--
-- Name: TABLE "access_codes"; Type: ACL; Schema: public; Owner: postgres
--

GRANT ALL ON TABLE "public"."access_codes" TO "anon";
GRANT ALL ON TABLE "public"."access_codes" TO "authenticated";
GRANT ALL ON TABLE "public"."access_codes" TO "service_role";


--
-- Name: TABLE "categories"; Type: ACL; Schema: public; Owner: postgres
--

GRANT ALL ON TABLE "public"."categories" TO "anon";
GRANT ALL ON TABLE "public"."categories" TO "authenticated";
GRANT ALL ON TABLE "public"."categories" TO "service_role";


--
-- Name: TABLE "content_approval_requests"; Type: ACL; Schema: public; Owner: postgres
--

GRANT ALL ON TABLE "public"."content_approval_requests" TO "anon";
GRANT ALL ON TABLE "public"."content_approval_requests" TO "authenticated";
GRANT ALL ON TABLE "public"."content_approval_requests" TO "service_role";


--
-- Name: TABLE "markets"; Type: ACL; Schema: public; Owner: postgres
--

GRANT ALL ON TABLE "public"."markets" TO "anon";
GRANT ALL ON TABLE "public"."markets" TO "authenticated";
GRANT ALL ON TABLE "public"."markets" TO "service_role";


--
-- Name: SEQUENCE "markets_id_seq"; Type: ACL; Schema: public; Owner: postgres
--

GRANT ALL ON SEQUENCE "public"."markets_id_seq" TO "anon";
GRANT ALL ON SEQUENCE "public"."markets_id_seq" TO "authenticated";
GRANT ALL ON SEQUENCE "public"."markets_id_seq" TO "service_role";


--
-- Name: TABLE "media_library"; Type: ACL; Schema: public; Owner: postgres
--

GRANT ALL ON TABLE "public"."media_library" TO "anon";
GRANT ALL ON TABLE "public"."media_library" TO "authenticated";
GRANT ALL ON TABLE "public"."media_library" TO "service_role";


--
-- Name: TABLE "questions"; Type: ACL; Schema: public; Owner: postgres
--

GRANT ALL ON TABLE "public"."questions" TO "anon";
GRANT ALL ON TABLE "public"."questions" TO "authenticated";
GRANT ALL ON TABLE "public"."questions" TO "service_role";


--
-- Name: TABLE "quiz_questions"; Type: ACL; Schema: public; Owner: postgres
--

GRANT ALL ON TABLE "public"."quiz_questions" TO "anon";
GRANT ALL ON TABLE "public"."quiz_questions" TO "authenticated";
GRANT ALL ON TABLE "public"."quiz_questions" TO "service_role";


--
-- Name: TABLE "quizzes"; Type: ACL; Schema: public; Owner: postgres
--

GRANT ALL ON TABLE "public"."quizzes" TO "anon";
GRANT ALL ON TABLE "public"."quizzes" TO "authenticated";
GRANT ALL ON TABLE "public"."quizzes" TO "service_role";


--
-- Name: TABLE "sections"; Type: ACL; Schema: public; Owner: postgres
--

GRANT ALL ON TABLE "public"."sections" TO "anon";
GRANT ALL ON TABLE "public"."sections" TO "authenticated";
GRANT ALL ON TABLE "public"."sections" TO "service_role";


--
-- Name: TABLE "study_guide_templates"; Type: ACL; Schema: public; Owner: postgres
--

GRANT ALL ON TABLE "public"."study_guide_templates" TO "anon";
GRANT ALL ON TABLE "public"."study_guide_templates" TO "authenticated";
GRANT ALL ON TABLE "public"."study_guide_templates" TO "service_role";


--
-- Name: TABLE "study_guides"; Type: ACL; Schema: public; Owner: postgres
--

GRANT ALL ON TABLE "public"."study_guides" TO "anon";
GRANT ALL ON TABLE "public"."study_guides" TO "authenticated";
GRANT ALL ON TABLE "public"."study_guides" TO "service_role";


--
-- Name: TABLE "supervisors"; Type: ACL; Schema: public; Owner: postgres
--

GRANT ALL ON TABLE "public"."supervisors" TO "anon";
GRANT ALL ON TABLE "public"."supervisors" TO "authenticated";
GRANT ALL ON TABLE "public"."supervisors" TO "service_role";


--
-- Name: SEQUENCE "supervisors_id_seq"; Type: ACL; Schema: public; Owner: postgres
--

GRANT ALL ON SEQUENCE "public"."supervisors_id_seq" TO "anon";
GRANT ALL ON SEQUENCE "public"."supervisors_id_seq" TO "authenticated";
GRANT ALL ON SEQUENCE "public"."supervisors_id_seq" TO "service_role";


--
-- Name: TABLE "user_dashboards"; Type: ACL; Schema: public; Owner: postgres
--

GRANT ALL ON TABLE "public"."user_dashboards" TO "anon";
GRANT ALL ON TABLE "public"."user_dashboards" TO "authenticated";
GRANT ALL ON TABLE "public"."user_dashboards" TO "service_role";


--
-- Name: TABLE "user_initialization"; Type: ACL; Schema: public; Owner: postgres
--

GRANT ALL ON TABLE "public"."user_initialization" TO "anon";
GRANT ALL ON TABLE "public"."user_initialization" TO "authenticated";
GRANT ALL ON TABLE "public"."user_initialization" TO "service_role";


--
-- Name: TABLE "secrets"; Type: ACL; Schema: vault; Owner: supabase_admin
--

-- GRANT SELECT,REFERENCES,DELETE,TRUNCATE ON TABLE "vault"."secrets" TO "postgres" WITH GRANT OPTION;
-- GRANT SELECT,DELETE ON TABLE "vault"."secrets" TO "service_role";


--
-- Name: TABLE "decrypted_secrets"; Type: ACL; Schema: vault; Owner: supabase_admin
--

-- GRANT SELECT,REFERENCES,DELETE,TRUNCATE ON TABLE "vault"."decrypted_secrets" TO "postgres" WITH GRANT OPTION;
-- GRANT SELECT,DELETE ON TABLE "vault"."decrypted_secrets" TO "service_role";


--
-- Name: DEFAULT PRIVILEGES FOR SEQUENCES; Type: DEFAULT ACL; Schema: public; Owner: postgres
--

ALTER DEFAULT PRIVILEGES FOR ROLE "postgres" IN SCHEMA "public" GRANT ALL ON SEQUENCES  TO "postgres";
ALTER DEFAULT PRIVILEGES FOR ROLE "postgres" IN SCHEMA "public" GRANT ALL ON SEQUENCES  TO "anon";
ALTER DEFAULT PRIVILEGES FOR ROLE "postgres" IN SCHEMA "public" GRANT ALL ON SEQUENCES  TO "authenticated";
ALTER DEFAULT PRIVILEGES FOR ROLE "postgres" IN SCHEMA "public" GRANT ALL ON SEQUENCES  TO "service_role";


--
-- Name: DEFAULT PRIVILEGES FOR SEQUENCES; Type: DEFAULT ACL; Schema: public; Owner: supabase_admin
--

-- ALTER DEFAULT PRIVILEGES FOR ROLE "supabase_admin" IN SCHEMA "public" GRANT ALL ON SEQUENCES  TO "postgres";
-- ALTER DEFAULT PRIVILEGES FOR ROLE "supabase_admin" IN SCHEMA "public" GRANT ALL ON SEQUENCES  TO "anon";
-- ALTER DEFAULT PRIVILEGES FOR ROLE "supabase_admin" IN SCHEMA "public" GRANT ALL ON SEQUENCES  TO "authenticated";
-- ALTER DEFAULT PRIVILEGES FOR ROLE "supabase_admin" IN SCHEMA "public" GRANT ALL ON SEQUENCES  TO "service_role";


--
-- Name: DEFAULT PRIVILEGES FOR FUNCTIONS; Type: DEFAULT ACL; Schema: public; Owner: postgres
--

ALTER DEFAULT PRIVILEGES FOR ROLE "postgres" IN SCHEMA "public" GRANT ALL ON FUNCTIONS  TO "postgres";
ALTER DEFAULT PRIVILEGES FOR ROLE "postgres" IN SCHEMA "public" GRANT ALL ON FUNCTIONS  TO "anon";
ALTER DEFAULT PRIVILEGES FOR ROLE "postgres" IN SCHEMA "public" GRANT ALL ON FUNCTIONS  TO "authenticated";
ALTER DEFAULT PRIVILEGES FOR ROLE "postgres" IN SCHEMA "public" GRANT ALL ON FUNCTIONS  TO "service_role";


--
-- Name: DEFAULT PRIVILEGES FOR FUNCTIONS; Type: DEFAULT ACL; Schema: public; Owner: supabase_admin
--

-- ALTER DEFAULT PRIVILEGES FOR ROLE "supabase_admin" IN SCHEMA "public" GRANT ALL ON FUNCTIONS  TO "postgres";
-- ALTER DEFAULT PRIVILEGES FOR ROLE "supabase_admin" IN SCHEMA "public" GRANT ALL ON FUNCTIONS  TO "anon";
-- ALTER DEFAULT PRIVILEGES FOR ROLE "supabase_admin" IN SCHEMA "public" GRANT ALL ON FUNCTIONS  TO "authenticated";
-- ALTER DEFAULT PRIVILEGES FOR ROLE "supabase_admin" IN SCHEMA "public" GRANT ALL ON FUNCTIONS  TO "service_role";


--
-- Name: DEFAULT PRIVILEGES FOR TABLES; Type: DEFAULT ACL; Schema: public; Owner: postgres
--

ALTER DEFAULT PRIVILEGES FOR ROLE "postgres" IN SCHEMA "public" GRANT ALL ON TABLES  TO "postgres";
ALTER DEFAULT PRIVILEGES FOR ROLE "postgres" IN SCHEMA "public" GRANT ALL ON TABLES  TO "anon";
ALTER DEFAULT PRIVILEGES FOR ROLE "postgres" IN SCHEMA "public" GRANT ALL ON TABLES  TO "authenticated";
ALTER DEFAULT PRIVILEGES FOR ROLE "postgres" IN SCHEMA "public" GRANT ALL ON TABLES  TO "service_role";


--
-- Name: DEFAULT PRIVILEGES FOR TABLES; Type: DEFAULT ACL; Schema: public; Owner: supabase_admin
--

-- ALTER DEFAULT PRIVILEGES FOR ROLE "supabase_admin" IN SCHEMA "public" GRANT ALL ON TABLES  TO "postgres";
-- ALTER DEFAULT PRIVILEGES FOR ROLE "supabase_admin" IN SCHEMA "public" GRANT ALL ON TABLES  TO "anon";
-- ALTER DEFAULT PRIVILEGES FOR ROLE "supabase_admin" IN SCHEMA "public" GRANT ALL ON TABLES  TO "authenticated";
-- ALTER DEFAULT PRIVILEGES FOR ROLE "supabase_admin" IN SCHEMA "public" GRANT ALL ON TABLES  TO "service_role";


--
-- Name: issue_graphql_placeholder; Type: EVENT TRIGGER; Schema: -; Owner: supabase_admin
--

-- CREATE EVENT TRIGGER "issue_graphql_placeholder" ON "sql_drop"
--          WHEN TAG IN ('DROP EXTENSION')
--    EXECUTE FUNCTION "extensions"."set_graphql_placeholder"();


-- ALTER EVENT TRIGGER "issue_graphql_placeholder" OWNER TO "supabase_admin";

--
-- Name: issue_pg_cron_access; Type: EVENT TRIGGER; Schema: -; Owner: supabase_admin
--

-- CREATE EVENT TRIGGER "issue_pg_cron_access" ON "ddl_command_end"
--          WHEN TAG IN ('CREATE EXTENSION')
--    EXECUTE FUNCTION "extensions"."grant_pg_cron_access"();


-- ALTER EVENT TRIGGER "issue_pg_cron_access" OWNER TO "supabase_admin";

--
-- Name: issue_pg_graphql_access; Type: EVENT TRIGGER; Schema: -; Owner: supabase_admin
--

-- CREATE EVENT TRIGGER "issue_pg_graphql_access" ON "ddl_command_end"
--          WHEN TAG IN ('CREATE FUNCTION')
--    EXECUTE FUNCTION "extensions"."grant_pg_graphql_access"();


-- ALTER EVENT TRIGGER "issue_pg_graphql_access" OWNER TO "supabase_admin";

--
-- Name: issue_pg_net_access; Type: EVENT TRIGGER; Schema: -; Owner: supabase_admin
--

-- CREATE EVENT TRIGGER "issue_pg_net_access" ON "ddl_command_end"
--          WHEN TAG IN ('CREATE EXTENSION')
--    EXECUTE FUNCTION "extensions"."grant_pg_net_access"();


-- ALTER EVENT TRIGGER "issue_pg_net_access" OWNER TO "supabase_admin";

--
-- Name: pgrst_ddl_watch; Type: EVENT TRIGGER; Schema: -; Owner: supabase_admin
--

-- CREATE EVENT TRIGGER "pgrst_ddl_watch" ON "ddl_command_end"
--    EXECUTE FUNCTION "extensions"."pgrst_ddl_watch"();


-- ALTER EVENT TRIGGER "pgrst_ddl_watch" OWNER TO "supabase_admin";

--
-- Name: pgrst_drop_watch; Type: EVENT TRIGGER; Schema: -; Owner: supabase_admin
--

-- CREATE EVENT TRIGGER "pgrst_drop_watch" ON "sql_drop"
--    EXECUTE FUNCTION "extensions"."pgrst_drop_watch"();


-- ALTER EVENT TRIGGER "pgrst_drop_watch" OWNER TO "supabase_admin";

--
-- PostgreSQL database dump complete
--

-- \unrestrict tkbMuKWbr7b26PpTD55uzeIjP0DEyyu7XENbMo85nAg9fGMEOmphTv7J8LipiQW
