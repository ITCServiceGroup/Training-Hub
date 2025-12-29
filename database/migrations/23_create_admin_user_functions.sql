-- Migration: Create Admin User Management Functions
-- Description: Functions for admins to create and manage users
-- Date: 2024

-- Enable pgcrypto extension for password hashing
CREATE EXTENSION IF NOT EXISTS pgcrypto;

-- Function to create a new user (admin only)
-- This function uses security definer to bypass RLS and create auth users
CREATE OR REPLACE FUNCTION public.admin_create_user(
  p_email TEXT,
  p_password TEXT,
  p_display_name TEXT,
  p_role TEXT,
  p_market_id INTEGER DEFAULT NULL,
  p_reports_to_user_id UUID DEFAULT NULL
)
RETURNS JSON
SECURITY DEFINER
SET search_path = extensions, public, auth
LANGUAGE plpgsql
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

-- Grant execute permission to authenticated users (function checks admin role internally)
GRANT EXECUTE ON FUNCTION public.admin_create_user TO authenticated;

-- Add comment
COMMENT ON FUNCTION public.admin_create_user IS
  'Creates a new user with auth account and profile. Only accessible to admin users.';
