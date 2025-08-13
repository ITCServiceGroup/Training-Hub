-- Migration 06: Create Markets and Supervisors Tables
-- This migration creates the market and supervisor management system

-- Create markets table
CREATE TABLE IF NOT EXISTS markets (
    id INTEGER PRIMARY KEY GENERATED ALWAYS AS IDENTITY,
    name CHARACTER VARYING UNIQUE NOT NULL,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Create supervisors table
CREATE TABLE IF NOT EXISTS supervisors (
    id INTEGER PRIMARY KEY GENERATED ALWAYS AS IDENTITY,
    name CHARACTER VARYING UNIQUE NOT NULL,
    market_id INTEGER NOT NULL COMMENT 'Reference to the market this supervisor belongs to',
    is_active BOOLEAN DEFAULT TRUE COMMENT 'Whether this supervisor is currently active and should appear in dropdown lists',
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Add comments to tables
COMMENT ON TABLE markets IS 'Market/location definitions for organizational structure';
COMMENT ON TABLE supervisors IS 'Supervisor information linked to specific markets';
COMMENT ON COLUMN supervisors.market_id IS 'Foreign key to markets table';
COMMENT ON COLUMN supervisors.is_active IS 'Soft delete flag - inactive supervisors are hidden but preserved';