import psycopg2
from psycopg2 import sql, pool
from psycopg2.extras import RealDictCursor
from typing import List, Dict, Any, Optional
from contextlib import contextmanager
import logging
import os

logger = logging.getLogger(__name__)


class DatabaseService:
    _instance = None
    _connection_pool = None
    
    def __new__(cls):
        if cls._instance is None:
            cls._instance = super(DatabaseService, cls).__new__(cls)
            cls._instance._initialize_pool()
        return cls._instance
    
    def _initialize_pool(self):
        try:
            self._connection_pool = pool.ThreadedConnectionPool(
                minconn=2,
                maxconn=20,
                host=os.getenv("DB_HOST", "localhost"),
                port=int(os.getenv("DB_PORT", 5432)),
                database=os.getenv("DB_NAME", "esg_db"),
                user=os.getenv("DB_USER", "postgres"),
                password=os.getenv("DB_PASSWORD", ""),
                cursor_factory=RealDictCursor,
                connect_timeout=10
            )
            logger.info("✅ Database connection pool initialized")
        except Exception as e:
            logger.error(f"❌ Failed to initialize database pool: {e}")
            raise
    
    @contextmanager
    def get_connection(self):
        conn = self._connection_pool.getconn()
        try:
            yield conn
            conn.commit()
        except Exception as e:
            conn.rollback()
            logger.error(f"Database error: {e}")
            raise
        finally:
            self._connection_pool.putconn(conn)
    
    def execute_query(
        self,
        query: str,
        params: Optional[tuple] = None,
        fetch_one: bool = False
    ) -> Optional[List[Dict[str, Any]]]:
        with self.get_connection() as conn:
            with conn.cursor() as cursor:
                cursor.execute(query, params)
                
                if fetch_one:
                    result = cursor.fetchone()
                    return dict(result) if result else None
                else:
                    results = cursor.fetchall()
                    return [dict(row) for row in results]
    
    def get_health_status(self) -> Dict[str, Any]:
        try:
            result = self.execute_query("SELECT 1 as status", fetch_one=True)
            return {"status": "healthy", "database": "connected"}
        except Exception as e:
            logger.error(f"Health check failed: {e}")
            return {"status": "unhealthy", "database": "disconnected", "error": str(e)}
    
    def get_top_companies(self, limit: int = 10) -> List[Dict[str, Any]]:
        query = """
            SELECT 
                "Symbol" as symbol,
                "Name" as name,
                "Sector" as sector,
                "Total ESG Risk score" as total_esg_risk_score
            FROM esg_data
            WHERE "Total ESG Risk score" IS NOT NULL
            ORDER BY "Total ESG Risk score" ASC
            LIMIT %s
        """
        return self.execute_query(query, (limit,))
    
    def get_sector_averages(self) -> List[Dict[str, Any]]:
        query = """
            SELECT 
                "Sector" as sector,
                AVG("Total ESG Risk score") as avg_esg_score,
                COUNT(*) as company_count
            FROM esg_data
            WHERE "Sector" IS NOT NULL 
              AND "Total ESG Risk score" IS NOT NULL
            GROUP BY "Sector"
            ORDER BY avg_esg_score ASC
        """
        return self.execute_query(query)
    
    def get_high_controversy_companies(self, min_score: float = 50.0) -> List[Dict[str, Any]]:
        query = """
            SELECT 
                "Symbol" as symbol,
                "Name" as name,
                "Controversy Score" as controversy_score,
                "Controversy Level" as controversy_level
            FROM esg_data
            WHERE "Controversy Score" >= %s
            ORDER BY "Controversy Score" DESC
        """
        return self.execute_query(query, (min_score,))
    
    def get_company_by_symbol(self, symbol: str) -> Optional[Dict[str, Any]]:
        query = """
            SELECT 
                "Symbol" as symbol,
                "Name" as name,
                "Sector" as sector,
                "Industry" as industry,
                "Total ESG Risk score" as total_esg_risk_score,
                "Environment Risk Score" as environment_risk_score,
                "Social Risk Score" as social_risk_score,
                "Governance Risk Score" as governance_risk_score,
                "Controversy Score" as controversy_score,
                "Controversy Level" as controversy_level,
                "ESG Risk Level" as esg_risk_level
            FROM esg_data
            WHERE UPPER("Symbol") = UPPER(%s)
            LIMIT 1
        """
        return self.execute_query(query, (symbol,), fetch_one=True)
    
    def search_companies(
        self,
        query_text: str,
        sector: Optional[str] = None,
        limit: int = 20
    ) -> List[Dict[str, Any]]:
        query = """
            SELECT 
                "Symbol" as symbol,
                "Name" as name,
                "Sector" as sector,
                "Total ESG Risk score" as total_esg_risk_score
            FROM esg_data
            WHERE ("Name" ILIKE %s OR "Symbol" ILIKE %s)
        """
        params = [f"%{query_text}%", f"%{query_text}%"]
        
        if sector:
            query += " AND UPPER(\"Sector\") = UPPER(%s)"
            params.append(sector)
        
        query += " ORDER BY \"Total ESG Risk score\" ASC LIMIT %s"
        params.append(limit)
        
        return self.execute_query(query, tuple(params))
    
    def close_pool(self):
        if self._connection_pool:
            self._connection_pool.closeall()
            logger.info("Database connection pool closed")


db_service = DatabaseService()
