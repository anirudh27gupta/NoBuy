from flask import Blueprint, jsonify, g
from db import execute_query
from utils.auth_middleware import jwt_required

notifications_bp = Blueprint('notifications', __name__, url_prefix='/api/notifications')

@notifications_bp.route('', methods=['GET'])
@jwt_required
def get_notifications():
    notifications = execute_query(
        """SELECT * FROM notifications 
           WHERE user_id = %s 
           ORDER BY created_at DESC 
           LIMIT 30""",
        (g.user_id,),
        fetch_all=True
    )
    for n in notifications:
        n['is_read'] = bool(n['is_read'])
        if n.get('created_at'):
            n['created_at'] = n['created_at'].isoformat()
    return jsonify({'success': True, 'notifications': notifications}), 200

@notifications_bp.route('/<int:notif_id>/read', methods=['PUT'])
@jwt_required
def mark_read(notif_id):
    execute_query(
        "UPDATE notifications SET is_read = 1 WHERE id = %s AND user_id = %s",
        (notif_id, g.user_id),
        commit=True
    )
    return jsonify({'success': True, 'message': 'Notification marked as read'}), 200

@notifications_bp.route('/read-all', methods=['PUT'])
@jwt_required
def mark_all_read():
    execute_query(
        "UPDATE notifications SET is_read = 1 WHERE user_id = %s",
        (g.user_id,),
        commit=True
    )
    return jsonify({'success': True, 'message': 'All notifications marked as read'}), 200
