import mysql.connector
from mysql.connector import pooling
import logging
from config import Config

logger = logging.getLogger(__name__)

# Connection pool holder
_pool = None

def init_pool():
    global _pool
    if _pool is None:
        try:
            _pool = pooling.MySQLConnectionPool(
                pool_name="nobuy_pool",
                pool_size=5,
                host=Config.MYSQL_HOST,
                port=Config.MYSQL_PORT,
                user=Config.MYSQL_USER,
                password=Config.MYSQL_PASSWORD,
                database=Config.MYSQL_DB,
                collation=Config.MYSQL_COLLATION,
                autocommit=False
            )
            logger.info("MySQL connection pool established successfully.")
        except Exception as e:
            logger.warning(f"Could not initialize connection pool with database {Config.MYSQL_DB}: {e}")
            _pool = None

def get_connection(use_database=True):
    """
    Returns a MySQL connection.
    If use_database is False, connects to the server without selecting a specific database.
    """
    global _pool
    if use_database:
        if _pool is None:
            init_pool()
        if _pool:
            try:
                return _pool.get_connection()
            except Exception as e:
                logger.warning(f"Failed to get connection from pool, falling back to direct connection: {e}")
        
        # Direct connection with database
        return mysql.connector.connect(
            host=Config.MYSQL_HOST,
            port=Config.MYSQL_PORT,
            user=Config.MYSQL_USER,
            password=Config.MYSQL_PASSWORD,
            database=Config.MYSQL_DB,
            collation=Config.MYSQL_COLLATION
        )
    else:
        # Direct connection without database (for CREATE DATABASE)
        return mysql.connector.connect(
            host=Config.MYSQL_HOST,
            port=Config.MYSQL_PORT,
            user=Config.MYSQL_USER,
            password=Config.MYSQL_PASSWORD,
            collation=Config.MYSQL_COLLATION
        )

def execute_query(query, params=None, fetch_one=False, fetch_all=False, commit=False):
    """
    Executes a query and optionally fetches results or commits changes.
    Returns results as dictionary/list of dictionaries or lastrowid/rowcount.
    """
    conn = get_connection()
    cursor = conn.cursor(dictionary=True)
    try:
        cursor.execute(query, params or ())
        result = None
        if fetch_one:
            result = cursor.fetchone()
        elif fetch_all:
            result = cursor.fetchall()
        elif commit:
            conn.commit()
            result = {
                'last_insert_id': cursor.lastrowid,
                'rowcount': cursor.rowcount
            }
        else:
            result = cursor.rowcount
        return result
    except Exception as e:
        if commit:
            conn.rollback()
        logger.error(f"Error executing query: {query} with params {params}. Error: {e}")
        raise e
    finally:
        cursor.close()
        conn.close()
