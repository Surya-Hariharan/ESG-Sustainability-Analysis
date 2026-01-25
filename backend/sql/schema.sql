BEGIN;

CREATE TABLE IF NOT EXISTS esg_companies (
	id SERIAL PRIMARY KEY,
	symbol TEXT NOT NULL,
	name TEXT NOT NULL,
	address TEXT,
	sector TEXT,
	industry TEXT,
	full_time_employees INTEGER CHECK (full_time_employees IS NULL OR full_time_employees >= 0),
	description TEXT,
	total_esg_risk_score DOUBLE PRECISION CHECK (total_esg_risk_score IS NULL OR (total_esg_risk_score >= 0 AND total_esg_risk_score <= 100)),
	environment_risk_score DOUBLE PRECISION CHECK (environment_risk_score IS NULL OR (environment_risk_score >= 0 AND environment_risk_score <= 100)),
	social_risk_score DOUBLE PRECISION CHECK (social_risk_score IS NULL OR (social_risk_score >= 0 AND social_risk_score <= 100)),
	governance_risk_score DOUBLE PRECISION CHECK (governance_risk_score IS NULL OR (governance_risk_score >= 0 AND governance_risk_score <= 100)),
	controversy_level TEXT,
	controversy_score DOUBLE PRECISION CHECK (controversy_score IS NULL OR (controversy_score >= 0 AND controversy_score <= 100)),
	esg_risk_percentile DOUBLE PRECISION CHECK (esg_risk_percentile IS NULL OR (esg_risk_percentile >= 0 AND esg_risk_percentile <= 100)),
	esg_risk_level TEXT,
	created_at TIMESTAMP DEFAULT NOW() NOT NULL,
	updated_at TIMESTAMP DEFAULT NOW() NOT NULL,
	UNIQUE(symbol)
);

CREATE OR REPLACE FUNCTION set_updated_at()
RETURNS TRIGGER AS $$
BEGIN
	NEW.updated_at = NOW();
	RETURN NEW;
END;
$$ LANGUAGE plpgsql;

DROP TRIGGER IF EXISTS trg_esg_companies_updated ON esg_companies;
CREATE TRIGGER trg_esg_companies_updated
BEFORE UPDATE ON esg_companies
FOR EACH ROW EXECUTE PROCEDURE set_updated_at();

CREATE INDEX IF NOT EXISTS idx_esg_companies_symbol ON esg_companies(symbol);
CREATE INDEX IF NOT EXISTS idx_esg_companies_sector ON esg_companies(sector);
CREATE INDEX IF NOT EXISTS idx_esg_companies_esg_score ON esg_companies(total_esg_risk_score);
CREATE INDEX IF NOT EXISTS idx_esg_companies_sector_score ON esg_companies(sector, total_esg_risk_score);
CREATE INDEX IF NOT EXISTS idx_esg_companies_controversy ON esg_companies(controversy_score DESC) WHERE controversy_score IS NOT NULL;

COMMIT;

