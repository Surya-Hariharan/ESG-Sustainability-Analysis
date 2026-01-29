-- ==============================================================================
-- Bulk Data Import Script
-- ==============================================================================
-- Purpose: Import ESG company data from CSV files into the database
-- Usage: Run after 01_create_tables.sql
-- ==============================================================================

BEGIN;

-- ==============================================================================
-- Step 1: Create Staging Table
-- ==============================================================================
-- Temporary table that matches sample data structure

DROP TABLE IF EXISTS staging_esg_data;

CREATE TEMP TABLE staging_esg_data (
    symbol TEXT,
    name TEXT,
    sector TEXT,
    industry TEXT,
    total_esg_risk_score DOUBLE PRECISION,
    environment_risk_score DOUBLE PRECISION,
    social_risk_score DOUBLE PRECISION,
    governance_risk_score DOUBLE PRECISION,
    controversy_level INTEGER,
    controversy_score DOUBLE PRECISION,
    esg_risk_percentile DOUBLE PRECISION,
    esg_risk_level TEXT
) ON COMMIT DROP;

-- ==============================================================================
-- Step 2: Import Sample Data
-- ==============================================================================
-- Insert sample data for testing
-- For CSV import, use: \copy staging_esg_data(...) FROM 'path/to/file.csv' CSV HEADER;

INSERT INTO staging_esg_data (
    symbol,
    name,
    sector,
    industry,
    total_esg_risk_score,
    environment_risk_score,
    social_risk_score,
    governance_risk_score,
    controversy_level,
    controversy_score,
    esg_risk_percentile,
    esg_risk_level
) VALUES 
('AAPL', 'Apple Inc.', 'Technology', 'Consumer Electronics', 23.5, 8.2, 7.1, 8.2, 2, 15.3, 25.4, 'Low'),
('MSFT', 'Microsoft Corporation', 'Technology', 'Software', 21.8, 7.5, 6.9, 7.4, 1, 12.1, 22.1, 'Low'),
('GOOGL', 'Alphabet Inc.', 'Technology', 'Internet Services', 28.9, 9.8, 8.7, 10.4, 3, 22.5, 31.2, 'Medium'),
('TSLA', 'Tesla Inc.', 'Consumer Cyclical', 'Auto Manufacturers', 45.6, 15.2, 14.8, 15.6, 4, 38.9, 65.8, 'High'),
('JPM', 'JPMorgan Chase & Co.', 'Financial Services', 'Banks', 35.7, 11.8, 12.1, 11.8, 3, 28.4, 42.3, 'Medium'),
('XOM', 'Exxon Mobil Corporation', 'Energy', 'Oil & Gas', 58.2, 28.5, 15.7, 14.0, 5, 52.1, 89.3, 'High'),
('JNJ', 'Johnson & Johnson', 'Healthcare', 'Pharmaceuticals', 19.4, 6.8, 5.9, 6.7, 2, 11.8, 18.9, 'Low'),
('WMT', 'Walmart Inc.', 'Consumer Defensive', 'Discount Stores', 31.2, 12.4, 9.8, 9.0, 3, 24.7, 38.6, 'Medium'),
('V', 'Visa Inc.', 'Financial Services', 'Credit Services', 16.9, 5.2, 5.8, 5.9, 1, 8.4, 14.2, 'Low'),
('NVDA', 'NVIDIA Corporation', 'Technology', 'Semiconductors', 27.3, 9.1, 8.9, 9.3, 2, 19.8, 29.7, 'Medium');

-- ==============================================================================
-- Step 3: Data Cleaning and Validation
-- ==============================================================================
-- Clean and normalize data in staging table before final insert

-- Trim whitespace from text fields
UPDATE staging_esg_data
SET 
    symbol = TRIM(symbol),
    name = TRIM(name),
    sector = TRIM(sector),
    industry = TRIM(industry),
    esg_risk_level = TRIM(esg_risk_level);

-- Validate required fields
DELETE FROM staging_esg_data
WHERE symbol IS NULL 
   OR symbol = '' 
   OR name IS NULL 
   OR name = '';

-- Validate numeric ranges
DELETE FROM staging_esg_data
WHERE total_esg_risk_score < 0 
   OR total_esg_risk_score > 100
   OR environment_risk_score < 0
   OR environment_risk_score > 50
   OR social_risk_score < 0
   OR social_risk_score > 50
   OR governance_risk_score < 0
   OR governance_risk_score > 50;

-- ==============================================================================
-- Step 4: Upsert Data into Main Table
-- ==============================================================================
-- Insert new records or update existing ones based on symbol (UPSERT)

INSERT INTO esg_companies (
    symbol,
    name,
    sector,
    industry,
    total_esg_risk_score,
    environment_risk_score,
    social_risk_score,
    governance_risk_score,
    controversy_level,
    controversy_score,
    esg_risk_percentile,
    esg_risk_level
)
SELECT 
    symbol,
    name,
    sector,
    industry,
    total_esg_risk_score,
    environment_risk_score,
    social_risk_score,
    governance_risk_score,
    controversy_level,
    controversy_score,
    esg_risk_percentile,
    esg_risk_level
FROM staging_esg_data
WHERE symbol IS NOT NULL 
  AND name IS NOT NULL  -- Ensure required fields are present
ON CONFLICT (symbol) 
DO UPDATE SET
    -- Update all fields with new data
    name = EXCLUDED.name,
    sector = EXCLUDED.sector,
    industry = EXCLUDED.industry,
    total_esg_risk_score = EXCLUDED.total_esg_risk_score,
    environment_risk_score = EXCLUDED.environment_risk_score,
    social_risk_score = EXCLUDED.social_risk_score,
    governance_risk_score = EXCLUDED.governance_risk_score,
    controversy_level = EXCLUDED.controversy_level,
    controversy_score = EXCLUDED.controversy_score,
    esg_risk_percentile = EXCLUDED.esg_risk_percentile,
    esg_risk_level = EXCLUDED.esg_risk_level,
    updated_at = CURRENT_TIMESTAMP;

-- ==============================================================================
-- Step 5: Post-Import Statistics
-- ==============================================================================

DO $$
DECLARE
    total_rows INT;
    rows_with_scores INT;
    sectors_count INT;
BEGIN
    SELECT COUNT(*) INTO total_rows FROM esg_companies;
    SELECT COUNT(*) INTO rows_with_scores FROM esg_companies WHERE total_esg_risk_score IS NOT NULL;
    SELECT COUNT(DISTINCT sector) INTO sectors_count FROM esg_companies;
    
    RAISE NOTICE 'Import completed:';
    RAISE NOTICE '- Total companies: %', total_rows;
    RAISE NOTICE '- Companies with ESG scores: %', rows_with_scores;
    RAISE NOTICE '- Unique sectors: %', sectors_count;
END $$;

-- Show sample of imported data
SELECT 
    'Sample Data' as status,
    symbol,
    name,
    sector,
    total_esg_risk_score,
    esg_risk_level
FROM esg_companies 
ORDER BY symbol 
LIMIT 10;

COMMIT;

-- ==============================================================================
-- End of Data Import Script
-- ==============================================================================
