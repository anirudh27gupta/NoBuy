from flask import Blueprint, request, jsonify, g
from db import execute_query
from utils.auth_middleware import jwt_required
from utils.notify import create_notification

reviews_bp = Blueprint('reviews', __name__, url_prefix='/api/reviews')

@reviews_bp.route('', methods=['POST'])
@jwt_required
def create_review():
    data = request.get_json() or {}
    booking_id = data.get('booking_id')
    rating = data.get('rating')
    comment = data.get('comment', '').strip()

    if not booking_id or rating is None or not comment:
        return jsonify({'success': False, 'message': 'Booking ID, rating, and comment are required'}), 400

    try:
        rating = int(rating)
        if rating < 1 or rating > 5:
            raise ValueError()
    except (ValueError, TypeError):
        return jsonify({'success': False, 'message': 'Rating must be an integer between 1 and 5'}), 400

    booking = execute_query(
        """SELECT b.*, p.title AS product_title, p.owner_id 
           FROM bookings b
           JOIN products p ON b.product_id = p.id
           WHERE b.id = %s""",
        (booking_id,),
        fetch_one=True
    )
    if not booking:
        return jsonify({'success': False, 'message': 'Booking not found'}), 404

    if booking['renter_id'] != g.user_id:
        return jsonify({'success': False, 'message': 'Only the renter can review this completed rental'}), 403

    if booking['status'] != 'completed':
        return jsonify({'success': False, 'message': 'You can only review completed rentals'}), 400

    # Check if review already submitted
    existing = execute_query(
        "SELECT id FROM reviews WHERE booking_id = %s AND reviewer_id = %s",
        (booking_id, g.user_id),
        fetch_one=True
    )
    if existing:
        return jsonify({'success': False, 'message': 'You have already reviewed this booking'}), 400

    res = execute_query(
        """INSERT INTO reviews (booking_id, product_id, reviewer_id, target_user_id, rating, comment)
           VALUES (%s, %s, %s, %s, %s, %s)""",
        (booking_id, booking['product_id'], g.user_id, booking['owner_id'], rating, comment),
        commit=True
    )
    review_id = res['last_insert_id']

    # Notify product owner
    create_notification(
        booking['owner_id'],
        f"New {rating}-Star Review!",
        f"{g.current_user['full_name']} left a {rating}★ review for '{booking['product_title']}': \"{comment[:80]}...\"",
        "review",
        f"/product/{booking['product_id']}"
    )

    return jsonify({
        'success': True,
        'message': 'Review submitted successfully',
        'review_id': review_id
    }), 201

@reviews_bp.route('/product/<int:product_id>', methods=['GET'])
def get_product_reviews(product_id):
    query = """
        SELECT 
            r.*,
            u.full_name AS reviewer_name,
            u.avatar_url AS reviewer_avatar
        FROM reviews r
        JOIN users u ON r.reviewer_id = u.id
        WHERE r.product_id = %s
        ORDER BY r.created_at DESC
    """
    reviews = execute_query(query, (product_id,), fetch_all=True)
    for rev in reviews:
        if rev.get('created_at'):
            rev['created_at'] = rev['created_at'].isoformat()
    return jsonify({'success': True, 'reviews': reviews}), 200

@reviews_bp.route('/user/<int:user_id>', methods=['GET'])
def get_user_reviews(user_id):
    query = """
        SELECT 
            r.*,
            p.title AS product_title,
            u.full_name AS reviewer_name,
            u.avatar_url AS reviewer_avatar
        FROM reviews r
        JOIN products p ON r.product_id = p.id
        JOIN users u ON r.reviewer_id = u.id
        WHERE r.target_user_id = %s
        ORDER BY r.created_at DESC
    """
    reviews = execute_query(query, (user_id,), fetch_all=True)
    for rev in reviews:
        if rev.get('created_at'):
            rev['created_at'] = rev['created_at'].isoformat()
    return jsonify({'success': True, 'reviews': reviews}), 200
