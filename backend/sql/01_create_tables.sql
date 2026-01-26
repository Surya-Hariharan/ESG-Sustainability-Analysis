-- ==============================================================================
-- ESG Companies Database Schema - Table Definitions and Constraints
-- ==============================================================================
-- Purpose: Create and manage the esg_companies table with proper indexes,
--          constraints, and triggers for ESG sustainability data analysis
--
-- Created: 2024
-- Last Modified: 2026-01-26
-- ==============================================================================

BEGIN;

-- ==============================================================================
-- Main Table: esg_companies
-- ==============================================================================
-- Stores comprehensive ESG (Environmental, Social, Governance) data for companies
-- including risk scores, controversy metrics, and company details

CREATE TABLE IF NOT EXISTS esg_companies (
    -- Primary Key
    id SERIAL PRIMARY KEY,
    
    -- Company Identifiers (NOT NULL - Required)
    symbol TEXT NOT NULL,
    name TEXT NOT NULL,
    
    -- Company Details (Optional)
    address TEXT,
    sector TEXT,
    industry TEXT,
    full_time_employees INTEGER 
        CHECK (full_time_employees IS NULL OR full_time_employees >= 0),
    description TEXT,
    
    -- ESG Risk Scores (0-100 scale, Optional)
    total_esg_risk_score DOUBLE PRECISION 
        CHECK (total_esg_risk_score IS NULL OR 
               (total_esg_risk_score >= 0 AND total_esg_risk_score <= 100)),
    environment_risk_score DOUBLE PRECISION 
        CHECK (environment_risk_score IS NULL OR 
               (environment_risk_score >= 0 AND environment_risk_score <= 100)),
    social_risk_score DOUBLE PRECISION 
        CHECK (social_risk_score IS NULL OR 
               (social_risk_score >= 0 AND social_risk_score <= 100)),
    governance_risk_score DOUBLE PRECISION 
        CHECK (governance_risk_score IS NULL OR 
               (governance_risk_score >= 0 AND governance_risk_score <= 100)),
    
    -- Controversy Metrics
    controversy_level TEXT,
    controversy_score DOUBLE PRECISION 
        CHECK (controversy_score IS NULL OR 
               (controversy_score >= 0 AND controversy_score <= 100)),
    
    -- Risk Classification
    esg_risk_percentile DOUBLE PRECISION 
        CHECK (esg_risk_percentile IS NULL OR 
               (esg_risk_percentile >= 0 AND esg_risk_percentile <= 100)),
    esg_risk_level TEXT,
    
    -- Audit Timestamps
    created_at TIMESTAMP DEFAULT NOW() NOT NULL,
    updated_at TIMESTAMP DEFAULT NOW() NOT NULL,
    
    -- Unique Constraints
    CONSTRAINT unique_company_symbol UNIQUE(symbol)
);

-- ==============================================================================
-- Comments for Documentation
-- ==============================================================================

COMMENT ON TABLE esg_companies IS 
'Primary table storing ESG risk and sustainability metrics for companies';

COMMENT ON COLUMN esg_companies.symbol IS 
'Stock ticker symbol - unique identifier for the company';

COMMENT ON COLUMN esg_companies.total_esg_risk_score IS 
'Overall ESG risk score (0-100): Lower scores indicate better ESG performance';

COMMENT ON COLUMN esg_companies.environment_risk_score IS 
'Environmental risk subscore (0-100)';

COMMENT ON COLUMN esg_companies.social_risk_score IS 
'Social risk subscore (0-100)';

COMMENT ON COLUMN esg_companies.governance_risk_score IS 
'Governance risk subscore (0-100)';

COMMENT ON COLUMN esg_companies.controversy_score IS 
'Controversy risk score (0-100): Higher scores indicate more controversies';

-- ==============================================================================
-- Function: Auto-update Timestamp
-- ==============================================================================
-- Automatically updates the updated_at column when a row is modified

CREATE OR REPLACE FUNCTION update_modified_timestamp()
RETURNS TRIGGER AS $$
BEGIN
    NEW.updated_at = NOW();
    RETURN NEW;
END;
$$ LANGUAGE plpgsql;

COMMENT ON FUNCTION update_modified_timestamp() IS 
'Trigger function to automatically update the updated_at timestamp';

-- ==============================================================================
-- Trigger: Auto-update Timestamp
-- ==============================================================================

DROP TRIGGER IF EXISTS trigger_update_esg_companies_timestamp ON esg_companies;

CREATE TRIGGER trigger_update_esg_companies_timestamp
    BEFORE UPDATE ON esg_companies
    FOR EACH ROW
    EXECUTE FUNCTION update_modified_timestamp();

-- ==============================================================================
-- Performance Indexes
-- ==============================================================================

-- Index for fast symbol lookup (most common query)
CREATE INDEX IF NOT EXISTS idx_esg_symbol 
    ON esg_companies(symbol);

-- Index for sector-based queries and filtering
CREATE INDEX IF NOT EXISTS idx_esg_sector 
    ON esg_companies(sector) 
    WHERE sector IS NOT NULL;

-- Index for industry-based queries
CREATE INDEX IF NOT EXISTS idx_esg_industry 
    ON esg_companies(industry) 
    WHERE industry IS NOT NULL;

-- Index for ESG score queries (sorting and filtering)
CREATE INDEX IF NOT EXISTS idx_esg_total_score 
    ON esg_companies(total_esg_risk_score) 
    WHERE total_esg_risk_score IS NOT NULL;

-- Composite index for sector + score queries (optimization)
CREATE INDEX IF NOT EXISTS idx_esg_sector_score 
    ON esg_companies(sector, total_esg_risk_score) 
    WHERE sector IS NOT NULL AND total_esg_risk_score IS NOT NULL;

-- Index for controversy filtering (descending for top controversies)
CREATE INDEX IF NOT EXISTS idx_esg_controversy 
    ON esg_companies(controversy_score DESC) 
    WHERE controversy_score IS NOT NULL;

-- Index for risk level categorization
CREATE INDEX IF NOT EXISTS idx_esg_risk_level 
    ON esg_companies(esg_risk_level) 
    WHERE esg_risk_level IS NOT NULL;

-- Composite index for multi-dimensional analysis
CREATE INDEX IF NOT EXISTS idx_esg_sector_industry_score
    ON esg_companies(sector, industry, total_esg_risk_score)
    WHERE sector IS NOT NULL 
      AND industry IS NOT NULL 
      AND total_esg_risk_score IS NOT NULL;

-- ==============================================================================
-- Index Comments
-- ==============================================================================

COMMENT ON INDEX idx_esg_symbol IS 
'Primary lookup index for company symbol searches';

COMMENT ON INDEX idx_esg_sector IS 
'Enables fast sector-based filtering and grouping';

COMMENT ON INDEX idx_esg_total_score IS 
'Optimizes queries sorting or filtering by ESG risk score';

COMMENT ON INDEX idx_esg_sector_score IS 
'Composite index for sector benchmarking queries';

-- ==============================================================================
-- Grant Permissions (if needed for specific roles)
-- ==============================================================================

-- Uncomment and modify for production environments with specific roles
-- GRANT SELECT ON esg_companies TO readonly_user;
-- GRANT SELECT, INSERT, UPDATE ON esg_companies TO app_user;
-- GRANT ALL PRIVILEGES ON esg_companies TO admin_user;

COMMIT;

-- ==============================================================================
-- End of Schema Definition
-- ==============================================================================
