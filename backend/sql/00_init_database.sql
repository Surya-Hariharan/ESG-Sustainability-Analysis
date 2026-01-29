-- ==============================================================================
-- Database Initialization Script
-- ==============================================================================
-- Purpose: Create database and setup initial configuration
-- Run this FIRST before other SQL scripts
-- ==============================================================================

-- Terminate existing connections (requires superuser)
-- SELECT pg_terminate_backend(pg_stat_activity.pid)
-- FROM pg_stat_activity
-- WHERE pg_stat_activity.datname = 'esg_db'
--   AND pid <> pg_backend_pid();

-- Drop database if exists (use with caution in production!)
DROP DATABASE IF EXISTS esg_db;

-- Create database
CREATE DATABASE esg_db
    WITH 
    OWNER = postgres
    ENCODING = 'UTF8'
    LC_COLLATE = 'C'
    LC_CTYPE = 'C'
    TABLESPACE = pg_default
    CONNECTION LIMIT = -1
    TEMPLATE = template0;

COMMENT ON DATABASE esg_db IS 
'ESG Sustainability Analysis Platform Database';

-- Connect to the new database
\c esg_db

-- Enable required extensions
CREATE EXTENSION IF NOT EXISTS "uuid-ossp";
CREATE EXTENSION IF NOT EXISTS "pg_trgm";  -- For fuzzy text search
CREATE EXTENSION IF NOT EXISTS "btree_gin";  -- For JSONB indexing

-- Create schemas if needed
CREATE SCHEMA IF NOT EXISTS public;

-- Grant usage
GRANT ALL ON SCHEMA public TO postgres;
GRANT ALL ON SCHEMA public TO public;

-- ==============================================================================
-- End of Database Initialization
-- ==============================================================================
