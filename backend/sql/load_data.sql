BEGIN;

DROP TABLE IF EXISTS staging_esg_companies;
CREATE TEMP TABLE staging_esg_companies
ON COMMIT DROP AS
SELECT * FROM esg_companies WHERE false;

COPY staging_esg_companies(symbol, name, address, sector, industry, full_time_employees,
                           description, total_esg_risk_score, environment_risk_score,
                           governance_risk_score, social_risk_score, controversy_level,
                           controversy_score, esg_risk_percentile, esg_risk_level)
FROM 'data/processed/esg_data_cleaned.csv'
DELIMITER ',' CSV HEADER;

UPDATE staging_esg_companies
SET symbol = TRIM(symbol),
    name = TRIM(name),
    sector = NULLIF(TRIM(sector), ''),
    industry = NULLIF(TRIM(industry), '');

INSERT INTO esg_companies AS t (
    symbol, name, address, sector, industry, full_time_employees,
    description, total_esg_risk_score, environment_risk_score,
    governance_risk_score, social_risk_score, controversy_level,
    controversy_score, esg_risk_percentile, esg_risk_level
)
SELECT symbol, name, address, sector, industry, full_time_employees,
       description, total_esg_risk_score, environment_risk_score,
       governance_risk_score, social_risk_score, controversy_level,
       controversy_score, esg_risk_percentile, esg_risk_level
FROM staging_esg_companies s
ON CONFLICT (symbol) DO UPDATE SET
    name = EXCLUDED.name,
    address = EXCLUDED.address,
    sector = EXCLUDED.sector,
    industry = EXCLUDED.industry,
    full_time_employees = EXCLUDED.full_time_employees,
    description = EXCLUDED.description,
    total_esg_risk_score = EXCLUDED.total_esg_risk_score,
    environment_risk_score = EXCLUDED.environment_risk_score,
    governance_risk_score = EXCLUDED.governance_risk_score,
    social_risk_score = EXCLUDED.social_risk_score,
    controversy_level = EXCLUDED.controversy_level,
    controversy_score = EXCLUDED.controversy_score,
    esg_risk_percentile = EXCLUDED.esg_risk_percentile,
    esg_risk_level = EXCLUDED.esg_risk_level,
    updated_at = NOW();

DO $$
DECLARE
    inserted_count int;
    total_count int;
BEGIN
    SELECT COUNT(*) INTO total_count FROM esg_companies;
    RAISE NOTICE 'Total esg_companies rows after load: %', total_count;
END $$;

COMMIT;
