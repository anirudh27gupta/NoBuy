import jwt
import datetime
from functools import wraps
from flask import request, jsonify, g
from config import Config
from db import execute_query

def generate_token(user_id, email, full_name):
    """
    Generates a JWT access token valid for configured hours.
    """
    payload = {
        'user_id': user_id,
        'email': email,
        'full_name': full_name,
        'exp': datetime.datetime.utcnow() + datetime.timedelta(hours=Config.JWT_ACCESS_TOKEN_EXPIRES_HOURS),
        'iat': datetime.datetime.utcnow()
    }
    token = jwt.encode(payload, Config.JWT_SECRET_KEY, algorithm='HS256')
    return token

def decode_token(token):
    """
    Decodes and validates a JWT token.
    """
    try:
        payload = jwt.decode(token, Config.JWT_SECRET_KEY, algorithms=['HS256'])
        return payload
    except jwt.ExpiredSignatureError:
        return None
    except jwt.InvalidTokenError:
        return None

def jwt_required(f):
    """
    Decorator to protect routes requiring authentication.
    Injects g.current_user and g.user_id.
    """
    @wraps(f)
    def decorated_function(*args, **kwargs):
        auth_header = request.headers.get('Authorization', None)
        if not auth_header:
            return jsonify({'success': False, 'message': 'Authorization header is missing'}), 401
        
        parts = auth_header.split()
        if parts[0].lower() != 'bearer' or len(parts) != 2:
            return jsonify({'success': False, 'message': 'Invalid token format. Expected: Bearer <token>'}), 401
        
        token = parts[1]
        payload = decode_token(token)
        if not payload:
            return jsonify({'success': False, 'message': 'Token is invalid or has expired'}), 401
        
        user = execute_query(
            "SELECT id, full_name, email, phone, address, avatar_url, bio, created_at FROM users WHERE id = %s",
            (payload['user_id'],),
            fetch_one=True
        )
        if not user:
            return jsonify({'success': False, 'message': 'User associated with token no longer exists'}), 401
        
        g.current_user = user
        g.user_id = user['id']
        return f(*args, **kwargs)
    return decorated_function

def optional_jwt(f):
    """
    Decorator for endpoints where authentication is optional.
    If valid token is provided, populates g.current_user and g.user_id; otherwise None.
    """
    @wraps(f)
    def decorated_function(*args, **kwargs):
        auth_header = request.headers.get('Authorization', None)
        g.current_user = None
        g.user_id = None
        if auth_header:
            parts = auth_header.split()
            if parts[0].lower() == 'bearer' and len(parts) == 2:
                payload = decode_token(parts[1])
                if payload:
                    user = execute_query(
                        "SELECT id, full_name, email, phone, address, avatar_url, bio, created_at FROM users WHERE id = %s",
                        (payload['user_id'],),
                        fetch_one=True
                    )
                    if user:
                        g.current_user = user
                        g.user_id = user['id']
        return f(*args, **kwargs)
    return decorated_function
