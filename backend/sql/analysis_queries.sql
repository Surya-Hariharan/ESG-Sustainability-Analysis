SELECT name, symbol, sector, total_esg_risk_score
FROM esg_companies
WHERE total_esg_risk_score IS NOT NULL
ORDER BY total_esg_risk_score ASC
LIMIT 10;

SELECT sector,
			 ROUND(AVG(total_esg_risk_score)::numeric,2) AS avg_esg_score,
			 ROUND(STDDEV_POP(total_esg_risk_score)::numeric,2) AS std_esg_score,
			 COUNT(*) AS company_count
FROM esg_companies
WHERE total_esg_risk_score IS NOT NULL
GROUP BY sector
HAVING COUNT(*) >= 3
ORDER BY avg_esg_score ASC;

SELECT name, symbol, controversy_score, controversy_level
FROM esg_companies
WHERE controversy_score IS NOT NULL
	AND controversy_score >= 50
ORDER BY controversy_score DESC;

SELECT name, symbol, governance_risk_score
FROM esg_companies
WHERE governance_risk_score IS NOT NULL
ORDER BY governance_risk_score ASC
LIMIT 10;

WITH scored AS (
		SELECT sector,
					 total_esg_risk_score,
					 width_bucket(total_esg_risk_score, 0, 100, 5) AS bucket
		FROM esg_companies
		WHERE total_esg_risk_score IS NOT NULL
)
SELECT sector,
			 bucket,
			 COUNT(*) as bucket_count,
			 ROUND( (COUNT(*) * 100.0 / SUM(COUNT(*)) OVER (PARTITION BY sector))::numeric, 2) AS pct_within_sector
FROM scored
GROUP BY sector, bucket
ORDER BY sector, bucket;

SELECT id, symbol, sector,
			 total_esg_risk_score, environment_risk_score, social_risk_score,
			 governance_risk_score, controversy_score, esg_risk_percentile
FROM esg_companies
WHERE total_esg_risk_score IS NOT NULL;

SELECT controversy_level, COUNT(*) AS companies
FROM esg_companies
WHERE controversy_level IS NOT NULL
GROUP BY controversy_level
ORDER BY companies DESC;
