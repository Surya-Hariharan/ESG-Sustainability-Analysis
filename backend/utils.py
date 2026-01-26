"""Utility functions for database operations and data loading.

Provides helper functions for bulk data loading, query execution,
and database health checks.
"""
import pandas as pd
import numpy as np
import psycopg2
from psycopg2.extras import execute_values
import logging
import os

logger = logging.getLogger(__name__)


def _get_simple_connection():
    """Get a simple database connection for bulk operations.
    
    Note: This is used for bulk loading operations. For regular queries,
    use services/database.py which provides connection pooling.
    """
    return psycopg2.connect(
        host=os.getenv("DB_HOST", "localhost"),
        port=int(os.getenv("DB_PORT", 5432)),
        database=os.getenv("DB_NAME", "esg_db"),
        user=os.getenv("DB_USER", "postgres"),
        password=os.getenv("DB_PASSWORD", ""),
    )


def load_dataframe_to_db(df: pd.DataFrame, table_name: str, chunk_size: int = 10_000):
    """Bulk load a DataFrame into a PostgreSQL table using batched inserts.

    Args:
        df: Data to persist.
        table_name: Target table name.
        chunk_size: Number of rows per execute_values batch.
    
    Returns:
        Number of rows inserted.
    """
    if df.empty:
        logger.warning("DataFrame is empty. Skipping load for table %s", table_name)
        return 0

    conn = _get_simple_connection()
    cursor = conn.cursor()
    cols = ','.join([f'"{c}"' for c in df.columns])
    total_inserted = 0
    try:
        def _py(v):
            # Normalize values to pure Python types psycopg2 can adapt
            if v is None:
                return None
            if isinstance(v, float) and (pd.isna(v)):
                return None
            if pd.isna(v):  # catches pandas NA / NaT
                return None
            if isinstance(v, (np.generic,)):
                try:
                    return v.item()
                except Exception:
                    return None
            return v

        for start in range(0, len(df), chunk_size):
            subset = df.iloc[start:start + chunk_size]
            subset_clean = subset.where(~subset.isna(), None)
            tuples = [tuple(_py(val) for val in row) for row in subset_clean.itertuples(index=False, name=None)]
            if not tuples:
                continue
            query = f"INSERT INTO {table_name} ({cols}) VALUES %s"
            execute_values(cursor, query, tuples)
            total_inserted += len(subset_clean)
        conn.commit()
        logger.info("Inserted %s rows into %s", total_inserted, table_name)
    except Exception as exc:
        conn.rollback()
        logger.exception("Failed inserting into %s: %s", table_name, exc)
        raise
    finally:
        cursor.close()
        conn.close()
    return total_inserted


def fetch_query(query: str, params=None) -> pd.DataFrame:
    """Execute a SQL query and return a pandas DataFrame.
    
    Args:
        query: SQL query string.
        params: Optional query parameters.
        
    Returns:
        DataFrame with query results.
    """
    conn = _get_simple_connection()
    try:
        df = pd.read_sql(query, conn, params=params)  # type: ignore[arg-type]
    finally:
        conn.close()
    return df


def get_db_health():
    """Check database connectivity for health endpoint.
    
    Returns:
        Tuple of (is_healthy: bool, message: str)
    """
    try:
        conn = _get_simple_connection()
        cur = conn.cursor()
        cur.execute("SELECT 1")
        cur.fetchone()
        cur.close()
        conn.close()
        return True, "ok"
    except psycopg2.OperationalError as exc:
        return False, f"unreachable: {exc}"  # pragma: no cover
    except Exception as exc:  # pragma: no cover
        return False, f"error: {exc}"
