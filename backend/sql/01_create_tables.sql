-- ==============================================================================
-- ESG Sustainability Analysis - Database Schema
-- ==============================================================================
-- Purpose: Complete database schema for ESG risk analysis platform
-- Version: 2.0
-- Created: 2026-01-29
-- ==============================================================================

-- Drop existing tables if recreating
DROP TABLE IF EXISTS agent_analysis_cache CASCADE;
DROP TABLE IF EXISTS news_cache CASCADE;
DROP TABLE IF EXISTS model_predictions CASCADE;
DROP TABLE IF EXISTS esg_companies CASCADE;

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
-- Table: model_predictions
-- ==============================================================================
-- Stores ML model prediction history for auditing and analysis

CREATE TABLE IF NOT EXISTS model_predictions (
    id SERIAL PRIMARY KEY,
    company_symbol TEXT NOT NULL,
    predicted_risk_level TEXT NOT NULL,
    confidence DOUBLE PRECISION NOT NULL CHECK (confidence >= 0 AND confidence <= 1),
    probabilities JSONB NOT NULL,
    input_features JSONB NOT NULL,
    model_version TEXT DEFAULT '1.0',
    created_at TIMESTAMP DEFAULT NOW() NOT NULL,
    
    CONSTRAINT fk_company_symbol 
        FOREIGN KEY (company_symbol) 
        REFERENCES esg_companies(symbol) 
        ON DELETE CASCADE
);

CREATE INDEX IF NOT EXISTS idx_predictions_symbol ON model_predictions(company_symbol);
CREATE INDEX IF NOT EXISTS idx_predictions_created ON model_predictions(created_at DESC);

COMMENT ON TABLE model_predictions IS 
'Stores historical ML model predictions for companies';

-- ==============================================================================
-- Table: news_cache
-- ==============================================================================
-- Caches news articles from external APIs to reduce API calls

CREATE TABLE IF NOT EXISTS news_cache (
    id SERIAL PRIMARY KEY,
    company_symbol TEXT NOT NULL,
    query_hash TEXT NOT NULL,
    articles JSONB NOT NULL,
    source TEXT DEFAULT 'newsapi',
    cached_at TIMESTAMP DEFAULT NOW() NOT NULL,
    expires_at TIMESTAMP NOT NULL,
    
    CONSTRAINT unique_news_cache UNIQUE(company_symbol, query_hash)
);

CREATE INDEX IF NOT EXISTS idx_news_cache_symbol ON news_cache(company_symbol);
CREATE INDEX IF NOT EXISTS idx_news_cache_expires ON news_cache(expires_at);

COMMENT ON TABLE news_cache IS 
'Caches external news API responses to improve performance and reduce API costs';

-- ==============================================================================
-- Table: agent_analysis_cache
-- ==============================================================================
-- Caches multi-agent analysis results

CREATE TABLE IF NOT EXISTS agent_analysis_cache (
    id SERIAL PRIMARY KEY,
    company_symbol TEXT NOT NULL,
    analysis_type TEXT NOT NULL,
    result JSONB NOT NULL,
    agents_involved TEXT[] NOT NULL,
    created_at TIMESTAMP DEFAULT NOW() NOT NULL,
    expires_at TIMESTAMP NOT NULL,
    
    CONSTRAINT unique_analysis_cache UNIQUE(company_symbol, analysis_type)
);

CREATE INDEX IF NOT EXISTS idx_agent_cache_symbol ON agent_analysis_cache(company_symbol);
CREATE INDEX IF NOT EXISTS idx_agent_cache_expires ON agent_analysis_cache(expires_at);

COMMENT ON TABLE agent_analysis_cache IS 
'Caches results from multi-agent ESG analysis to improve response times';

-- ==============================================================================
-- Function: Clean expired cache entries
-- ==============================================================================

CREATE OR REPLACE FUNCTION clean_expired_cache()
RETURNS INTEGER AS $$
DECLARE
    deleted_count INTEGER;
BEGIN
    DELETE FROM news_cache WHERE expires_at < NOW();
    GET DIAGNOSTICS deleted_count = ROW_COUNT;
    
    DELETE FROM agent_analysis_cache WHERE expires_at < NOW();
    GET DIAGNOSTICS deleted_count = deleted_count + ROW_COUNT;
    
    RETURN deleted_count;
END;
$$ LANGUAGE plpgsql;

COMMENT ON FUNCTION clean_expired_cache() IS 
'Removes expired cache entries from news_cache and agent_analysis_cache tables';

-- ==============================================================================
-- View: company_summary
-- ==============================================================================
-- Provides a quick summary view of companies with latest predictions

CREATE OR REPLACE VIEW company_summary AS
SELECT 
    e.symbol,
    e.name,
    e.sector,
    e.industry,
    e.total_esg_risk_score,
    e.environment_risk_score,
    e.social_risk_score,
    e.governance_risk_score,
    e.controversy_score,
    e.esg_risk_level,
    p.predicted_risk_level AS latest_prediction,
    p.confidence AS prediction_confidence,
    p.created_at AS prediction_date
FROM esg_companies e
LEFT JOIN LATERAL (
    SELECT predicted_risk_level, confidence, created_at
    FROM model_predictions
    WHERE company_symbol = e.symbol
    ORDER BY created_at DESC
    LIMIT 1
) p ON TRUE;

COMMENT ON VIEW company_summary IS 
'Aggregated view of companies with their latest model predictions';

-- ==============================================================================
-- Grant Permissions
-- ==============================================================================

-- Grant read-only access to application user
-- GRANT SELECT ON ALL TABLES IN SCHEMA public TO app_user;
-- GRANT SELECT ON ALL SEQUENCES IN SCHEMA public TO app_user;

-- Grant full access to admin
-- GRANT ALL PRIVILEGES ON ALL TABLES IN SCHEMA public TO admin_user;
-- GRANT ALL PRIVILEGES ON ALL SEQUENCES IN SCHEMA public TO admin_user;

COMMIT;

-- ==============================================================================
-- Database Statistics
-- ==============================================================================

SELECT 
    'esg_companies' AS table_name, 
    COUNT(*) AS row_count 
FROM esg_companies
UNION ALL
SELECT 
    'model_predictions', 
    COUNT(*) 
FROM model_predictions
UNION ALL
SELECT 
    'news_cache', 
    COUNT(*) 
FROM news_cache
UNION ALL
SELECT 
    'agent_analysis_cache', 
    COUNT(*) 
FROM agent_analysis_cache;

-- ==============================================================================
-- End of Schema Definition
-- ==============================================================================
