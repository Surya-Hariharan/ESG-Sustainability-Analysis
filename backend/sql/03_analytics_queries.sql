-- ==============================================================================
-- ESG Analytics Query Library
-- ==============================================================================
-- Purpose: Reusable SQL queries for ESG data analysis and reporting
--          Each query is self-contained and can be used independently
--
-- Categories:
--   1. Top Performers & Rankings
--   2. Sector & Industry Analysis
--   3. Risk Assessment
--   4. Controversy Analysis
--   5. Statistical Distributions
--   6. Benchmarking & Comparisons
--
-- Created: 2024
-- Last Modified: 2026-01-26
-- ==============================================================================

-- ==============================================================================
-- CATEGORY 1: TOP PERFORMERS & RANKINGS
-- ==============================================================================

-- Query 1.1: Top 10 Companies with Lowest ESG Risk (Best Performers)
-- Purpose: Identify companies with the best ESG performance
-- Usage: Good for showcasing sustainability leaders

SELECT 
    name,
    symbol,
    sector,
    total_esg_risk_score,
    esg_risk_level,
    environment_risk_score,
    social_risk_score,
    governance_risk_score
FROM esg_companies
WHERE total_esg_risk_score IS NOT NULL
ORDER BY total_esg_risk_score ASC
LIMIT 10;

-- Query 1.2: Bottom 10 Companies (Highest ESG Risk)
-- Purpose: Identify companies needing most improvement

SELECT 
    name,
    symbol,
    sector,
    total_esg_risk_score,
    esg_risk_level,
    controversy_score
FROM esg_companies
WHERE total_esg_risk_score IS NOT NULL
ORDER BY total_esg_risk_score DESC
LIMIT 10;

-- Query 1.3: Top Performers by Sector
-- Purpose: Best ESG performer in each sector

WITH ranked_by_sector AS (
    SELECT 
        name,
        symbol,
        sector,
        total_esg_risk_score,
        ROW_NUMBER() OVER (
            PARTITION BY sector 
            ORDER BY total_esg_risk_score ASC
        ) as rank_in_sector
    FROM esg_companies
    WHERE total_esg_risk_score IS NOT NULL
      AND sector IS NOT NULL
)
SELECT 
    sector,
    name,
    symbol,
    total_esg_risk_score
FROM ranked_by_sector
WHERE rank_in_sector = 1
ORDER BY total_esg_risk_score ASC;

-- ==============================================================================
-- CATEGORY 2: SECTOR & INDUSTRY ANALYSIS
-- ==============================================================================

-- Query 2.1: Sector-Level ESG Performance Summary
-- Purpose: Compare ESG performance across different sectors

SELECT 
    sector,
    ROUND(AVG(total_esg_risk_score)::NUMERIC, 2) AS avg_esg_score,
    ROUND(STDDEV_POP(total_esg_risk_score)::NUMERIC, 2) AS std_deviation,
    ROUND(MIN(total_esg_risk_score)::NUMERIC, 2) AS best_score,
    ROUND(MAX(total_esg_risk_score)::NUMERIC, 2) AS worst_score,
    COUNT(*) AS company_count
FROM esg_companies
WHERE total_esg_risk_score IS NOT NULL
  AND sector IS NOT NULL
GROUP BY sector
HAVING COUNT(*) >= 3  -- Only sectors with at least 3 companies
ORDER BY avg_esg_score ASC;

-- Query 2.2: Industry-Level Analysis
-- Purpose: Detailed industry breakdown within sectors

SELECT 
    sector,
    industry,
    COUNT(*) as companies,
    ROUND(AVG(total_esg_risk_score)::NUMERIC, 2) as avg_score,
    ROUND(AVG(environment_risk_score)::NUMERIC, 2) as avg_env,
    ROUND(AVG(social_risk_score)::NUMERIC, 2) as avg_social,
    ROUND(AVG(governance_risk_score)::NUMERIC, 2) as avg_gov
FROM esg_companies
WHERE total_esg_risk_score IS NOT NULL
  AND sector IS NOT NULL
  AND industry IS NOT NULL
GROUP BY sector, industry
HAVING COUNT(*) >= 2
ORDER BY sector, avg_score ASC;

-- Query 2.3: E, S, G Component Analysis by Sector
-- Purpose: Break down ESG into components for each sector

SELECT 
    sector,
    ROUND(AVG(environment_risk_score)::NUMERIC, 2) as avg_environmental,
    ROUND(AVG(social_risk_score)::NUMERIC, 2) as avg_social,
    ROUND(AVG(governance_risk_score)::NUMERIC, 2) as avg_governance,
    ROUND(AVG(total_esg_risk_score)::NUMERIC, 2) as avg_total,
    COUNT(*) as companies
FROM esg_companies
WHERE sector IS NOT NULL
  AND total_esg_risk_score IS NOT NULL
GROUP BY sector
ORDER BY avg_total ASC;

-- ==============================================================================
-- CATEGORY 3: RISK ASSESSMENT
-- ==============================================================================

-- Query 3.1: Risk Level Distribution
-- Purpose: Count companies in each risk category

SELECT 
    esg_risk_level,
    COUNT(*) as company_count,
    ROUND(COUNT(*) * 100.0 / SUM(COUNT(*)) OVER (), 2) as percentage
FROM esg_companies
WHERE esg_risk_level IS NOT NULL
GROUP BY esg_risk_level
ORDER BY 
    CASE esg_risk_level
        WHEN 'Low' THEN 1
        WHEN 'Medium' THEN 2
        WHEN 'High' THEN 3
        ELSE 4
    END;

-- Query 3.2: High-Risk Companies Requiring Attention
-- Purpose: List companies with elevated risk scores

SELECT 
    name,
    symbol,
    sector,
    total_esg_risk_score,
    environment_risk_score,
    social_risk_score,
    governance_risk_score,
    esg_risk_level
FROM esg_companies
WHERE total_esg_risk_score > 50  -- High risk threshold
ORDER BY total_esg_risk_score DESC;

-- Query 3.3: Companies with Best Governance Scores
-- Purpose: Identify governance leaders

SELECT 
    name,
    symbol,
    sector,
    governance_risk_score,
    total_esg_risk_score
FROM esg_companies
WHERE governance_risk_score IS NOT NULL
ORDER BY governance_risk_score ASC
LIMIT 20;

-- ==============================================================================
-- CATEGORY 4: CONTROVERSY ANALYSIS
-- ==============================================================================

-- Query 4.1: High Controversy Companies
-- Purpose: Flag companies with significant controversies

SELECT 
    name,
    symbol,
    sector,
    controversy_score,
    controversy_level,
    total_esg_risk_score
FROM esg_companies
WHERE controversy_score IS NOT NULL
  AND controversy_score >= 50  -- High controversy threshold
ORDER BY controversy_score DESC;

-- Query 4.2: Controversy Distribution by Level
-- Purpose: Understand controversy landscape

SELECT 
    controversy_level,
    COUNT(*) as companies,
    ROUND(AVG(controversy_score)::NUMERIC, 2) as avg_score,
    ROUND(AVG(total_esg_risk_score)::NUMERIC, 2) as avg_esg_score
FROM esg_companies
WHERE controversy_level IS NOT NULL
GROUP BY controversy_level
ORDER BY avg_score DESC;

-- Query 4.3: Sector Controversy Analysis
-- Purpose: Which sectors have the most controversies

SELECT 
    sector,
    COUNT(*) as total_companies,
    COUNT(CASE WHEN controversy_score >= 50 THEN 1 END) as high_controversy,
    ROUND(AVG(controversy_score)::NUMERIC, 2) as avg_controversy,
    ROUND(
        COUNT(CASE WHEN controversy_score >= 50 THEN 1 END) * 100.0 / 
        COUNT(*), 
        2
    ) as pct_high_controversy
FROM esg_companies
WHERE sector IS NOT NULL
  AND controversy_score IS NOT NULL
GROUP BY sector
ORDER BY pct_high_controversy DESC;

-- ==============================================================================
-- CATEGORY 5: STATISTICAL DISTRIBUTIONS
-- ==============================================================================

-- Query 5.1: ESG Score Distribution by Buckets
-- Purpose: Histogram-style analysis of score distribution

WITH score_buckets AS (
    SELECT 
        sector,
        total_esg_risk_score,
        WIDTH_BUCKET(total_esg_risk_score, 0, 100, 10) as bucket
    FROM esg_companies
    WHERE total_esg_risk_score IS NOT NULL
      AND sector IS NOT NULL
)
SELECT 
    sector,
    bucket,
    (bucket - 1) * 10 || '-' || bucket * 10 as score_range,
    COUNT(*) as company_count,
    ROUND(
        COUNT(*) * 100.0 / SUM(COUNT(*)) OVER (PARTITION BY sector),
        2
    ) as pct_within_sector
FROM score_buckets
GROUP BY sector, bucket
ORDER BY sector, bucket;

-- Query 5.2: Percentile Analysis
-- Purpose: Understand score distribution using percentiles

SELECT 
    PERCENTILE_CONT(0.10) WITHIN GROUP (ORDER BY total_esg_risk_score) as p10,
    PERCENTILE_CONT(0.25) WITHIN GROUP (ORDER BY total_esg_risk_score) as p25,
    PERCENTILE_CONT(0.50) WITHIN GROUP (ORDER BY total_esg_risk_score) as median,
    PERCENTILE_CONT(0.75) WITHIN GROUP (ORDER BY total_esg_risk_score) as p75,
    PERCENTILE_CONT(0.90) WITHIN GROUP (ORDER BY total_esg_risk_score) as p90,
    ROUND(AVG(total_esg_risk_score)::NUMERIC, 2) as mean,
    ROUND(STDDEV_POP(total_esg_risk_score)::NUMERIC, 2) as std_dev
FROM esg_companies
WHERE total_esg_risk_score IS NOT NULL;

-- ==============================================================================
-- CATEGORY 6: BENCHMARKING & COMPARISONS
-- ==============================================================================

-- Query 6.1: Company vs Sector Average Comparison
-- Purpose: See how companies compare to their sector

WITH sector_stats AS (
    SELECT 
        sector,
        AVG(total_esg_risk_score) as sector_avg
    FROM esg_companies
    WHERE total_esg_risk_score IS NOT NULL
      AND sector IS NOT NULL
    GROUP BY sector
)
SELECT 
    c.name,
    c.symbol,
    c.sector,
    ROUND(c.total_esg_risk_score::NUMERIC, 2) as company_score,
    ROUND(s.sector_avg::NUMERIC, 2) as sector_avg,
    ROUND((c.total_esg_risk_score - s.sector_avg)::NUMERIC, 2) as diff_from_avg,
    CASE 
        WHEN c.total_esg_risk_score < s.sector_avg THEN 'Above Average'
        WHEN c.total_esg_risk_score > s.sector_avg THEN 'Below Average'
        ELSE 'Average'
    END as performance
FROM esg_companies c
JOIN sector_stats s ON c.sector = s.sector
WHERE c.total_esg_risk_score IS NOT NULL
ORDER BY c.sector, c.total_esg_risk_score ASC;

-- Query 6.2: Multi-Dimensional ESG Analysis
-- Purpose: Comprehensive view for ML/Analytics

SELECT 
    id,
    symbol,
    name,
    sector,
    industry,
    total_esg_risk_score,
    environment_risk_score,
    social_risk_score,
    governance_risk_score,
    controversy_score,
    controversy_level,
    esg_risk_percentile,
    esg_risk_level,
    full_time_employees,
    -- Calculate component percentages
    CASE 
        WHEN total_esg_risk_score > 0 
        THEN ROUND((environment_risk_score / total_esg_risk_score * 100)::NUMERIC, 2)
        ELSE NULL 
    END as env_pct,
    CASE 
        WHEN total_esg_risk_score > 0 
        THEN ROUND((social_risk_score / total_esg_risk_score * 100)::NUMERIC, 2)
        ELSE NULL 
    END as social_pct,
    CASE 
        WHEN total_esg_risk_score > 0 
        THEN ROUND((governance_risk_score / total_esg_risk_score * 100)::NUMERIC, 2)
        ELSE NULL 
    END as gov_pct
FROM esg_companies
WHERE total_esg_risk_score IS NOT NULL
ORDER BY total_esg_risk_score ASC;

-- Query 6.3: Sector Leaders vs Laggards
-- Purpose: Identify top and bottom performers per sector

WITH sector_rankings AS (
    SELECT 
        name,
        symbol,
        sector,
        total_esg_risk_score,
        ROW_NUMBER() OVER (
            PARTITION BY sector 
            ORDER BY total_esg_risk_score ASC
        ) as best_rank,
        ROW_NUMBER() OVER (
            PARTITION BY sector 
            ORDER BY total_esg_risk_score DESC
        ) as worst_rank
    FROM esg_companies
    WHERE total_esg_risk_score IS NOT NULL
      AND sector IS NOT NULL
)
SELECT 
    sector,
    name,
    symbol,
    total_esg_risk_score,
    CASE 
        WHEN best_rank <= 3 THEN 'Top 3 Leader'
        WHEN worst_rank <= 3 THEN 'Bottom 3 Laggard'
    END as category
FROM sector_rankings
WHERE best_rank <= 3 OR worst_rank <= 3
ORDER BY sector, total_esg_risk_score ASC;

-- ==============================================================================
-- UTILITY QUERIES
-- ==============================================================================

-- Data Quality Check
SELECT 
    COUNT(*) as total_records,
    COUNT(total_esg_risk_score) as with_esg_score,
    COUNT(sector) as with_sector,
    COUNT(industry) as with_industry,
    COUNT(controversy_score) as with_controversy,
    CASE 
        WHEN COUNT(*) = 0 THEN 0
        ELSE ROUND(
            COUNT(total_esg_risk_score) * 100.0 / COUNT(*), 
            2
        )
    END as pct_complete
FROM esg_companies;

-- Recent Updates Check
SELECT 
    DATE(updated_at) as update_date,
    COUNT(*) as records_updated
FROM esg_companies
WHERE updated_at >= CURRENT_DATE - INTERVAL '7 days'
GROUP BY DATE(updated_at)
ORDER BY update_date DESC;

-- ==============================================================================
-- End of Analytics Query Library
-- ==============================================================================
