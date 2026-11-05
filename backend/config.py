import os
from pathlib import Path

try:
    from dotenv import load_dotenv
    load_dotenv(Path(__file__).resolve().with_name('.env'))
except ImportError:
    pass

class Config:
    MYSQL_HOST = os.environ.get('MYSQL_HOST', '127.0.0.1')
    MYSQL_PORT = int(os.environ.get('MYSQL_PORT', 3306))
    MYSQL_USER = os.environ.get('MYSQL_USER', 'root')
    MYSQL_PASSWORD = os.environ.get('MYSQL_PASSWORD', '')
    MYSQL_DB = os.environ.get('MYSQL_DB', 'nobuy_db')
    MYSQL_COLLATION = os.environ.get('MYSQL_COLLATION', 'utf8mb4_general_ci')
    
    JWT_SECRET_KEY = os.environ.get('JWT_SECRET_KEY', 'local-development-secret-change-before-deployment')
    JWT_ACCESS_TOKEN_EXPIRES_HOURS = int(os.environ.get('JWT_ACCESS_TOKEN_EXPIRES_HOURS', 72))
    
    SECRET_KEY = os.environ.get('SECRET_KEY', 'local-development-secret-change-before-deployment')
