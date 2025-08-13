-- Migration 04: Create Access Codes System
-- This migration creates the access codes table for controlling quiz access

-- Create v2_access_codes table
CREATE TABLE IF NOT EXISTS v2_access_codes (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    code CHARACTER VARYING UNIQUE NOT NULL,
    quiz_id UUID NOT NULL,
    email CHARACTER VARYING,
    ldap CHARACTER VARYING,
    market CHARACTER VARYING,
    supervisor CHARACTER VARYING,
    expires_at TIMESTAMP WITH TIME ZONE,
    is_used BOOLEAN DEFAULT FALSE,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Add comments to table
COMMENT ON TABLE v2_access_codes IS 'Access codes for controlling quiz access and tracking user information';
COMMENT ON COLUMN v2_access_codes.code IS 'Unique access code string';
COMMENT ON COLUMN v2_access_codes.is_used IS 'Whether this access code has been used';
COMMENT ON COLUMN v2_access_codes.expires_at IS 'When this access code expires (NULL means no expiration)';