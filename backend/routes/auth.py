from flask import Blueprint, request, jsonify, g
from werkzeug.security import generate_password_hash, check_password_hash
import re
from db import execute_query
from utils.auth_middleware import generate_token, jwt_required
from utils.notify import create_notification

auth_bp = Blueprint('auth', __name__, url_prefix='/api/auth')

EMAIL_REGEX = r'^[a-zA-Z0-9_.+-]+@[a-zA-Z0-9-]+\.[a-zA-Z0-9-.]+$'

@auth_bp.route('/register', methods=['POST'])
def register():
    data = request.get_json() or {}
    full_name = data.get('full_name', '').strip()
    email = data.get('email', '').strip().lower()
    password = data.get('password', '')
    phone = data.get('phone', '').strip()
    address = data.get('address', '').strip()

    if not full_name:
        return jsonify({'success': False, 'message': 'Full name is required'}), 400
    if not email or not re.match(EMAIL_REGEX, email):
        return jsonify({'success': False, 'message': 'A valid email address is required'}), 400
    if not password or len(password) < 6:
        return jsonify({'success': False, 'message': 'Password must be at least 6 characters long'}), 400

    # Check if email is already registered
    existing_user = execute_query(
        "SELECT id FROM users WHERE email = %s",
        (email,),
        fetch_one=True
    )
    if existing_user:
        return jsonify({'success': False, 'message': 'An account with this email already exists'}), 409

    # Hash password securely
    password_hash = generate_password_hash(password, method='pbkdf2:sha256')

    # Default avatar placeholder using initials
    avatar_url = f"https://api.dicebear.com/7.x/initials/svg?seed={full_name}"

    insert_result = execute_query(
        """INSERT INTO users (full_name, email, password_hash, phone, address, avatar_url)
           VALUES (%s, %s, %s, %s, %s, %s)""",
        (full_name, email, password_hash, phone or None, address or None, avatar_url),
        commit=True
    )
    user_id = insert_result['last_insert_id']

    # Generate JWT
    token = generate_token(user_id, email, full_name)

    user_data = {
        'id': user_id,
        'full_name': full_name,
        'email': email,
        'phone': phone,
        'address': address,
        'avatar_url': avatar_url,
        'bio': None
    }

    create_notification(
        user_id,
        "Welcome to No-Buy!",
        "Your unified account is ready. You can browse and rent items, or list your own gear right away!",
        "general",
        "/catalog"
    )

    return jsonify({
        'success': True,
        'message': 'Account created successfully',
        'token': token,
        'user': user_data
    }), 201

@auth_bp.route('/login', methods=['POST'])
def login():
    data = request.get_json() or {}
    email = data.get('email', '').strip().lower()
    password = data.get('password', '')

    if not email or not password:
        return jsonify({'success': False, 'message': 'Email and password are required'}), 400

    user = execute_query(
        "SELECT id, full_name, email, password_hash, phone, address, avatar_url, bio, created_at FROM users WHERE email = %s",
        (email,),
        fetch_one=True
    )

    if not user or not check_password_hash(user['password_hash'], password):
        return jsonify({'success': False, 'message': 'Invalid email or password'}), 401

    token = generate_token(user['id'], user['email'], user['full_name'])

    user_data = {
        'id': user['id'],
        'full_name': user['full_name'],
        'email': user['email'],
        'phone': user['phone'],
        'address': user['address'],
        'avatar_url': user['avatar_url'],
        'bio': user['bio'],
        'created_at': user['created_at'].isoformat() if user.get('created_at') else None
    }

    return jsonify({
        'success': True,
        'message': 'Logged in successfully',
        'token': token,
        'user': user_data
    }), 200

@auth_bp.route('/me', methods=['GET'])
@jwt_required
def get_me():
    user = g.current_user
    # Fetch active statistics
    stats = execute_query(
        """SELECT 
           (SELECT COUNT(*) FROM products WHERE owner_id = %s) as listed_count,
           (SELECT COUNT(*) FROM bookings WHERE renter_id = %s AND status = 'active') as active_rentals,
           (SELECT COUNT(*) FROM bookings WHERE renter_id = %s) as total_bookings,
           (SELECT COUNT(*) FROM notifications WHERE user_id = %s AND is_read = 0) as unread_notifs""",
        (user['id'], user['id'], user['id'], user['id']),
        fetch_one=True
    )
    
    user_response = {**user, 'stats': stats}
    if user_response.get('created_at'):
        user_response['created_at'] = user_response['created_at'].isoformat()

    return jsonify({
        'success': True,
        'user': user_response
    }), 200

@auth_bp.route('/profile', methods=['PUT'])
@jwt_required
def update_profile():
    data = request.get_json() or {}
    full_name = data.get('full_name', g.current_user['full_name']).strip()
    phone = data.get('phone', g.current_user['phone'])
    address = data.get('address', g.current_user['address'])
    bio = data.get('bio', g.current_user['bio'])
    avatar_url = data.get('avatar_url', g.current_user['avatar_url'])

    execute_query(
        """UPDATE users 
           SET full_name = %s, phone = %s, address = %s, bio = %s, avatar_url = %s 
           WHERE id = %s""",
        (full_name, phone, address, bio, avatar_url, g.user_id),
        commit=True
    )

    updated_user = execute_query(
        "SELECT id, full_name, email, phone, address, avatar_url, bio FROM users WHERE id = %s",
        (g.user_id,),
        fetch_one=True
    )

    return jsonify({
        'success': True,
        'message': 'Profile updated successfully',
        'user': updated_user
    }), 200
