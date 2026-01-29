-- ==============================================================================
-- ESG Data Bulk Import Utility
-- ==============================================================================
-- Purpose: Safely import and upsert ESG data from CSV files into the database
--          using staging tables and conflict resolution
--
-- Usage: Execute this script after preparing your CSV file
-- CSV Path: data/processed/esg_data_cleaned.csv
--
-- Created: 2024
-- Last Modified: 2026-01-26
-- ==============================================================================

BEGIN;

-- ==============================================================================
-- Step 1: Create Staging Table
-- ==============================================================================
-- Temporary table that matches esg_companies structure
-- Dropped automatically on commit

DROP TABLE IF EXISTS staging_esg_data;

CREATE TEMP TABLE staging_esg_data (
    symbol TEXT,
    name TEXT,
    address TEXT,
    sector TEXT,
    industry TEXT,
    full_time_employees INTEGER,
    description TEXT,
    total_esg_risk_score DOUBLE PRECISION,
    environment_risk_score DOUBLE PRECISION,
    governance_risk_score DOUBLE PRECISION,
    social_risk_score DOUBLE PRECISION,
    controversy_level TEXT,
    controversy_score DOUBLE PRECISION,
    esg_risk_percentile DOUBLE PRECISION,
    esg_risk_level TEXT
) ON COMMIT DROP;

-- ==============================================================================
-- Step 2: Import CSV Data into Staging Table
-- ==============================================================================
-- Adjust the file path as needed for your environment
-- For production, consider using \COPY command from psql client

COPY staging_esg_data(
    symbol,
    name,
    address,
    sector,
    industry,
    full_time_employees,
    description,
    total_esg_risk_score,
    environment_risk_score,
    governance_risk_score,
    social_risk_score,
    controversy_level,
    controversy_score,
    esg_risk_percentile,
    esg_risk_level
-- Import sample data for testing
-- Note: Replace with actual CSV import when data file is available
-- For CSV import, use: \copy staging_esg_data(...) FROM 'path/to/file.csv' CSV HEADER;

INSERT INTO staging_esg_data (
    symbol,
    company_name,
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
    address = TRIM(address),
    sector = TRIM(sector),
    industry = TRIM(industry),
    controversy_level = TRIM(controversy_level),
    esg_risk_level = TRIM(esg_risk_level);

-- Convert empty strings to NULL for optional fields
UPDATE staging_esg_data
SET 
    sector = NULLIF(sector, ''),
    industry = NULLIF(industry, ''),
    address = NULLIF(address, ''),
    description = NULLIF(description, ''),
    controversy_level = NULLIF(controversy_level, ''),
    esg_risk_level = NULLIF(esg_risk_level, '');

-- Validate and cap employee counts
UPDATE staging_esg_data
SET full_time_employees = NULL
WHERE full_time_employees < 0 
   OR full_time_employees > 10000000;  -- Cap at 10 million (data validation)

-- Ensure risk scores are within valid range (0-100)
UPDATE staging_esg_data
SET 
    total_esg_risk_score = NULL
WHERE total_esg_risk_score < 0 OR total_esg_risk_score > 100;

UPDATE staging_esg_data
SET 
    environment_risk_score = NULL
WHERE environment_risk_score < 0 OR environment_risk_score > 100;

UPDATE staging_esg_data
SET 
    social_risk_score = NULL
WHERE social_risk_score < 0 OR social_risk_score > 100;

UPDATE staging_esg_data
SET 
    governance_risk_score = NULL
WHERE governance_risk_score < 0 OR governance_risk_score > 100;

UPDATE staging_esg_data
SET 
    controversy_score = NULL
WHERE controversy_score < 0 OR controversy_score > 100;

-- ==============================================================================
-- Step 4: Upsert Data into Main Table
-- ==============================================================================
-- Insert new records or update existing ones based on symbol (UPSERT)

INSERT INTO esg_companies (
    symbol,
    company_name,
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
    company_name,
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
  AND company_name IS NOT NULL  -- Ensure required fields are present
ON CONFLICT (symbol) 
DO UPDATE SET
    -- Update all fields with new data
    company_name = EXCLUDED.company_name,
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
    social_risk_score = EXCLUDED.social_risk_score,
    controversy_level = EXCLUDED.controversy_level,
    controversy_score = EXCLUDED.controversy_score,
    esg_risk_percentile = EXCLUDED.esg_risk_percentile,
    esg_risk_level = EXCLUDED.esg_risk_level,
    updated_at = NOW()  -- Timestamp will be updated by trigger, but explicit is clear
WHERE 
    -- Only update if data has actually changed (optimization)
    esg_companies.name IS DISTINCT FROM EXCLUDED.name OR
    esg_companies.total_esg_risk_score IS DISTINCT FROM EXCLUDED.total_esg_risk_score OR
    esg_companies.environment_risk_score IS DISTINCT FROM EXCLUDED.environment_risk_score OR
    esg_companies.social_risk_score IS DISTINCT FROM EXCLUDED.social_risk_score OR
    esg_companies.governance_risk_score IS DISTINCT FROM EXCLUDED.governance_risk_score OR
    esg_companies.controversy_score IS DISTINCT FROM EXCLUDED.controversy_score;

-- ==============================================================================
-- Step 5: Post-Import Statistics and Validation
-- ==============================================================================

DO $$
DECLARE
    total_rows INT;
    rows_with_scores INT;
    sectors_count INT;
    avg_esg_score NUMERIC;
BEGIN
    -- Count total rows
    SELECT COUNT(*) INTO total_rows 
    FROM esg_companies;
    
    -- Count rows with ESG scores
    SELECT COUNT(*) INTO rows_with_scores 
    FROM esg_companies 
    WHERE total_esg_risk_score IS NOT NULL;
    
    -- Count unique sectors
    SELECT COUNT(DISTINCT sector) INTO sectors_count 
    FROM esg_companies 
    WHERE sector IS NOT NULL;
    
    -- Calculate average ESG score
    SELECT ROUND(AVG(total_esg_risk_score)::NUMERIC, 2) INTO avg_esg_score
    FROM esg_companies 
    WHERE total_esg_risk_score IS NOT NULL;
    
    -- Display import summary
    RAISE NOTICE '========================================';
    RAISE NOTICE 'ESG DATA IMPORT COMPLETED';
    RAISE NOTICE '========================================';
    RAISE NOTICE 'Total companies in database: %', total_rows;
    RAISE NOTICE 'Companies with ESG scores: %', rows_with_scores;
    RAISE NOTICE 'Unique sectors: %', sectors_count;
    RAISE NOTICE 'Average ESG risk score: %', avg_esg_score;
    RAISE NOTICE '========================================';
    
    -- Warn if data quality issues detected
    IF rows_with_scores < (total_rows * 0.5) THEN
        RAISE WARNING 'More than 50%% of companies are missing ESG scores';
    END IF;
    
    IF sectors_count < 5 THEN
        RAISE WARNING 'Only % distinct sectors found - data may be incomplete', sectors_count;
    END IF;
END $$;

-- ==============================================================================
-- Step 6: Cleanup and Analysis Recommendations
-- ==============================================================================

-- Analyze table for query optimization
ANALYZE esg_companies;

-- Vacuum if needed (removes dead tuples after large imports)
-- VACUUM ANALYZE esg_companies;

COMMIT;

-- ==============================================================================
-- Post-Import Verification Queries
-- ==============================================================================

-- Uncomment to run verification queries after import:

-- Check for duplicates
-- SELECT symbol, COUNT(*) 
-- FROM esg_companies 
-- GROUP BY symbol 
-- HAVING COUNT(*) > 1;

-- Check data completeness
-- SELECT 
--     COUNT(*) as total_companies,
--     COUNT(total_esg_risk_score) as with_esg_score,
--     COUNT(sector) as with_sector,
--     COUNT(industry) as with_industry
-- FROM esg_companies;

-- View sample of imported data
-- SELECT * FROM esg_companies LIMIT 10;

-- ==============================================================================
-- End of Data Import Script
-- ==============================================================================
