-- ==============================================================================
-- Database Maintenance Procedures
-- ==============================================================================
-- Purpose: Stored procedures for database maintenance and optimization
-- ==============================================================================

BEGIN;

-- ==============================================================================
-- Procedure: Vacuum and Analyze All Tables
-- ==============================================================================

CREATE OR REPLACE PROCEDURE vacuum_analyze_all()
LANGUAGE plpgsql AS $$
BEGIN
    VACUUM ANALYZE esg_companies;
    VACUUM ANALYZE model_predictions;
    VACUUM ANALYZE news_cache;
    VACUUM ANALYZE agent_analysis_cache;
    
    RAISE NOTICE 'Vacuum and analyze completed on all tables';
END;
$$;

COMMENT ON PROCEDURE vacuum_analyze_all() IS 
'Performs VACUUM ANALYZE on all tables to optimize query performance';

-- ==============================================================================
-- Procedure: Archive Old Predictions
-- ==============================================================================

CREATE OR REPLACE PROCEDURE archive_old_predictions(days_to_keep INTEGER DEFAULT 90)
LANGUAGE plpgsql AS $$
DECLARE
    deleted_count INTEGER;
BEGIN
    DELETE FROM model_predictions 
    WHERE created_at < NOW() - INTERVAL '1 day' * days_to_keep;
    
    GET DIAGNOSTICS deleted_count = ROW_COUNT;
    
    RAISE NOTICE 'Archived % old prediction records', deleted_count;
END;
$$;

COMMENT ON PROCEDURE archive_old_predictions(INTEGER) IS 
'Archives (deletes) prediction records older than specified days (default: 90)';

-- ==============================================================================
-- Procedure: Refresh Company Statistics
-- ==============================================================================

CREATE OR REPLACE PROCEDURE refresh_company_stats()
LANGUAGE plpgsql AS $$
BEGIN
    -- Update any computed statistics or materialized views here
    REFRESH MATERIALIZED VIEW IF EXISTS company_statistics;
    
    RAISE NOTICE 'Company statistics refreshed successfully';
END;
$$;

COMMENT ON PROCEDURE refresh_company_stats() IS 
'Refreshes computed statistics and materialized views for companies';

-- ==============================================================================
-- Scheduled Maintenance Job (Example - requires pg_cron extension)
-- ==============================================================================

-- To enable scheduled jobs:
-- CREATE EXTENSION IF NOT EXISTS pg_cron;

-- Clean cache daily at 2 AM
-- SELECT cron.schedule('clean-cache-daily', '0 2 * * *', 'SELECT clean_expired_cache();');

-- Vacuum weekly on Sunday at 3 AM
-- SELECT cron.schedule('vacuum-weekly', '0 3 * * 0', 'CALL vacuum_analyze_all();');

-- Archive old predictions monthly
-- SELECT cron.schedule('archive-monthly', '0 4 1 * *', 'CALL archive_old_predictions(90);');

COMMIT;

-- ==============================================================================
-- End of Maintenance Procedures
-- ==============================================================================
