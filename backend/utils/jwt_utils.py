import jwt
from datetime import datetime, timedelta
from flask import current_app
import os

# Secret key for JWT - in production, use environment variable
JWT_SECRET_KEY = os.getenv('JWT_SECRET_KEY', 'your-secret-key-change-in-production')
JWT_ALGORITHM = 'HS256'
ACCESS_TOKEN_EXPIRE_MINUTES = 60  # 15 minutes
REFRESH_TOKEN_EXPIRE_DAYS = 7  # 7 days


def generate_access_token(user_id, email):
    """Generate a short-lived access token"""
    payload = {
        'user_id': user_id,
        'email': email,
        'type': 'access',
        'exp': datetime.utcnow() + timedelta(minutes=ACCESS_TOKEN_EXPIRE_MINUTES),
        'iat': datetime.utcnow()
    }
    return jwt.encode(payload, JWT_SECRET_KEY, algorithm=JWT_ALGORITHM)


def generate_refresh_token(user_id, email):
    """Generate a long-lived refresh token"""
    payload = {
        'user_id': user_id,
        'email': email,
        'type': 'refresh',
        'exp': datetime.utcnow() + timedelta(days=REFRESH_TOKEN_EXPIRE_DAYS),
        'iat': datetime.utcnow()
    }
    return jwt.encode(payload, JWT_SECRET_KEY, algorithm=JWT_ALGORITHM)


def verify_token(token, token_type='access'):
    """Verify and decode a JWT token"""
    try:
        payload = jwt.decode(token, JWT_SECRET_KEY, algorithms=[JWT_ALGORITHM])
        
        # Verify token type
        if payload.get('type') != token_type:
            return None
        
        return payload
    except jwt.ExpiredSignatureError:
        return None
    except jwt.InvalidTokenError:
        return None


def get_user_from_token(token):
    """Extract user information from a token"""
    payload = verify_token(token)
    if payload:
        return {
            'user_id': payload.get('user_id'),
            'email': payload.get('email')
        }
    return None

