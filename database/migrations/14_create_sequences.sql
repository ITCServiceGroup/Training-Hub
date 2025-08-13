-- Migration 14: Create Database Sequences
-- This migration creates all database sequences for identity columns

-- Sequence for quiz_results table
CREATE SEQUENCE IF NOT EXISTS quiz_results_id_seq
    AS BIGINT
    START WITH 1
    INCREMENT BY 1
    NO MINVALUE
    NO MAXVALUE
    CACHE 1;

-- Sequence for v2_quiz_results table (deprecated)
CREATE SEQUENCE IF NOT EXISTS v2_quiz_results_new_id_seq
    AS BIGINT
    START WITH 1
    INCREMENT BY 1
    NO MINVALUE
    NO MAXVALUE
    CACHE 1;

-- Sequence for markets table
CREATE SEQUENCE IF NOT EXISTS markets_id_seq
    AS INTEGER
    START WITH 1
    INCREMENT BY 1
    NO MINVALUE
    NO MAXVALUE
    CACHE 1;

-- Sequence for supervisors table
CREATE SEQUENCE IF NOT EXISTS supervisors_id_seq
    AS INTEGER
    START WITH 1
    INCREMENT BY 1
    NO MINVALUE
    NO MAXVALUE
    CACHE 1;

-- Set sequence ownership to ensure proper permissions
ALTER SEQUENCE quiz_results_id_seq OWNED BY quiz_results.id;
ALTER SEQUENCE v2_quiz_results_new_id_seq OWNED BY v2_quiz_results.id;
ALTER SEQUENCE markets_id_seq OWNED BY markets.id;
ALTER SEQUENCE supervisors_id_seq OWNED BY supervisors.id;