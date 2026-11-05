from flask import Blueprint, request, jsonify, g
from datetime import datetime
from db import execute_query, get_connection
from utils.auth_middleware import jwt_required
from utils.notify import create_notification

bookings_bp = Blueprint('bookings', __name__, url_prefix='/api/bookings')

@bookings_bp.route('', methods=['POST'])
@jwt_required
def create_booking():
    data = request.get_json() or {}
    product_id = data.get('product_id')
    start_date_str = data.get('start_date')
    end_date_str = data.get('end_date')
    renter_note = data.get('renter_note', '').strip()
    negotiated_rate = data.get('negotiated_rate')

    if not product_id or not start_date_str or not end_date_str:
        return jsonify({'success': False, 'message': 'Product, start date, and end date are required'}), 400

    try:
        start_date = datetime.strptime(start_date_str, '%Y-%m-%d').date()
        end_date = datetime.strptime(end_date_str, '%Y-%m-%d').date()
    except ValueError:
        return jsonify({'success': False, 'message': 'Dates must be in YYYY-MM-DD format'}), 400

    if end_date < start_date:
        return jsonify({'success': False, 'message': 'End date must be on or after start date'}), 400

    total_days = (end_date - start_date).days + 1
    if total_days <= 0:
        total_days = 1

    conn = get_connection()
    cursor = conn.cursor(dictionary=True)
    try:
        # Serialize requests for this listing while checking and inserting the
        # booking, so simultaneous requests cannot reserve the same dates.
        cursor.execute("SELECT * FROM products WHERE id = %s FOR UPDATE", (product_id,))
        product = cursor.fetchone()
        if not product:
            conn.rollback()
            return jsonify({'success': False, 'message': 'Product not found'}), 404

        if product['owner_id'] == g.user_id:
            conn.rollback()
            return jsonify({'success': False, 'message': 'You cannot rent your own listed product'}), 400

        if not product['is_available']:
            conn.rollback()
            return jsonify({'success': False, 'message': 'This product is currently unavailable for rent'}), 400

        cursor.execute(
            """SELECT id FROM bookings
               WHERE product_id = %s
                 AND status IN ('pending', 'approved', 'active', 'return_pending')
                 AND start_date <= %s AND end_date >= %s
               LIMIT 1""",
            (product_id, end_date, start_date)
        )
        if cursor.fetchone():
            conn.rollback()
            return jsonify({'success': False, 'message': 'This item already has a booking that overlaps those dates'}), 409

        daily_rate = float(product['daily_rate'])
        is_negotiated = 0
        if negotiated_rate is not None:
            try:
                negotiated_rate = float(negotiated_rate)
            except (TypeError, ValueError):
                conn.rollback()
                return jsonify({'success': False, 'message': 'Negotiated rate must be a valid amount'}), 400
            if negotiated_rate > 0:
                daily_rate = negotiated_rate
                is_negotiated = 1

        security_deposit = float(product['security_deposit'])
        rent_amount = round(daily_rate * total_days, 2)
        total_amount = round(rent_amount + security_deposit, 2)

        cursor.execute(
            """INSERT INTO bookings
               (product_id, renter_id, start_date, end_date, total_days, daily_rate, rent_amount, security_deposit, total_amount, status, is_negotiated, renter_note)
               VALUES (%s, %s, %s, %s, %s, %s, %s, %s, %s, 'pending', %s, %s)""",
            (product_id, g.user_id, start_date, end_date, total_days, daily_rate, rent_amount, security_deposit, total_amount, is_negotiated, renter_note or None)
        )
        booking_id = cursor.lastrowid
        conn.commit()
    except Exception:
        conn.rollback()
        raise
    finally:
        cursor.close()
        conn.close()

    # Notify product owner
    create_notification(
        product['owner_id'],
        "New Rental Request",
        f"{g.current_user['full_name']} requested to rent '{product['title']}' for {total_days} days (₹{total_amount:.2f} total).",
        "booking",
        f"/dashboard?tab=requests"
    )

    return jsonify({
        'success': True,
        'message': 'Rental booking submitted successfully. Awaiting owner approval.',
        'booking_id': booking_id,
        'booking': {
            'id': booking_id,
            'total_days': total_days,
            'daily_rate': daily_rate,
            'rent_amount': rent_amount,
            'security_deposit': security_deposit,
            'total_amount': total_amount,
            'status': 'pending'
        }
    }), 201

@bookings_bp.route('/renter', methods=['GET'])
@jwt_required
def get_renter_bookings():
    query = """
        SELECT 
            b.*,
            p.title AS product_title,
            p.image_url AS product_image,
            p.category AS product_category,
            p.location AS product_location,
            u.id AS owner_id,
            u.full_name AS owner_name,
            u.avatar_url AS owner_avatar,
            u.phone AS owner_phone,
            pay.id AS payment_id,
            pay.status AS payment_status,
            pay.transaction_id,
            ret.id AS return_id,
            ret.status AS return_status,
            ret.refunded_deposit,
            (SELECT COUNT(*) FROM reviews rev WHERE rev.booking_id = b.id AND rev.reviewer_id = %s) AS has_reviewed
        FROM bookings b
        JOIN products p ON b.product_id = p.id
        JOIN users u ON p.owner_id = u.id
        LEFT JOIN payments pay ON b.id = pay.booking_id
        LEFT JOIN returns ret ON b.id = ret.booking_id
        WHERE b.renter_id = %s
        ORDER BY b.created_at DESC
    """
    bookings = execute_query(query, (g.user_id, g.user_id), fetch_all=True)
    for b in bookings:
        b['daily_rate'] = float(b['daily_rate'])
        b['rent_amount'] = float(b['rent_amount'])
        b['security_deposit'] = float(b['security_deposit'])
        b['total_amount'] = float(b['total_amount'])
        b['is_negotiated'] = bool(b['is_negotiated'])
        b['has_reviewed'] = bool(b['has_reviewed'])
        if b.get('start_date'):
            b['start_date'] = b['start_date'].isoformat()
        if b.get('end_date'):
            b['end_date'] = b['end_date'].isoformat()
        if b.get('created_at'):
            b['created_at'] = b['created_at'].isoformat()
    return jsonify({'success': True, 'bookings': bookings}), 200

@bookings_bp.route('/owner', methods=['GET'])
@jwt_required
def get_owner_bookings():
    query = """
        SELECT 
            b.*,
            p.title AS product_title,
            p.image_url AS product_image,
            p.category AS product_category,
            u.id AS renter_user_id,
            u.full_name AS renter_name,
            u.avatar_url AS renter_avatar,
            u.phone AS renter_phone,
            u.email AS renter_email,
            pay.id AS payment_id,
            pay.status AS payment_status,
            ret.id AS return_id,
            ret.status AS return_status,
            ret.item_condition,
            ret.damage_fee,
            ret.refunded_deposit
        FROM bookings b
        JOIN products p ON b.product_id = p.id
        JOIN users u ON b.renter_id = u.id
        LEFT JOIN payments pay ON b.id = pay.booking_id
        LEFT JOIN returns ret ON b.id = ret.booking_id
        WHERE p.owner_id = %s
        ORDER BY b.created_at DESC
    """
    bookings = execute_query(query, (g.user_id,), fetch_all=True)
    for b in bookings:
        b['daily_rate'] = float(b['daily_rate'])
        b['rent_amount'] = float(b['rent_amount'])
        b['security_deposit'] = float(b['security_deposit'])
        b['total_amount'] = float(b['total_amount'])
        b['is_negotiated'] = bool(b['is_negotiated'])
        if b.get('start_date'):
            b['start_date'] = b['start_date'].isoformat()
        if b.get('end_date'):
            b['end_date'] = b['end_date'].isoformat()
        if b.get('created_at'):
            b['created_at'] = b['created_at'].isoformat()
    return jsonify({'success': True, 'bookings': bookings}), 200

@bookings_bp.route('/<int:booking_id>', methods=['GET'])
@jwt_required
def get_booking_detail(booking_id):
    query = """
        SELECT 
            b.*,
            p.title AS product_title,
            p.image_url AS product_image,
            p.description AS product_description,
            p.location AS product_location,
            p.owner_id,
            renter.full_name AS renter_name,
            renter.email AS renter_email,
            renter.phone AS renter_phone,
            owner.full_name AS owner_name,
            owner.email AS owner_email,
            owner.phone AS owner_phone
        FROM bookings b
        JOIN products p ON b.product_id = p.id
        JOIN users renter ON b.renter_id = renter.id
        JOIN users owner ON p.owner_id = owner.id
        WHERE b.id = %s
    """
    b = execute_query(query, (booking_id,), fetch_one=True)
    if not b:
        return jsonify({'success': False, 'message': 'Booking not found'}), 404

    if b['renter_id'] != g.user_id and b['owner_id'] != g.user_id:
        return jsonify({'success': False, 'message': 'Unauthorized to view this booking'}), 403

    b['daily_rate'] = float(b['daily_rate'])
    b['rent_amount'] = float(b['rent_amount'])
    b['security_deposit'] = float(b['security_deposit'])
    b['total_amount'] = float(b['total_amount'])
    if b.get('start_date'):
        b['start_date'] = b['start_date'].isoformat()
    if b.get('end_date'):
        b['end_date'] = b['end_date'].isoformat()

    # Fetch associated payment and return info
    b['payment'] = execute_query("SELECT * FROM payments WHERE booking_id = %s", (booking_id,), fetch_one=True)
    b['return_info'] = execute_query("SELECT * FROM returns WHERE booking_id = %s", (booking_id,), fetch_one=True)

    return jsonify({'success': True, 'booking': b}), 200

@bookings_bp.route('/<int:booking_id>/status', methods=['PUT'])
@jwt_required
def update_booking_status(booking_id):
    data = request.get_json() or {}
    new_status = data.get('status', '').lower()

    valid_statuses = ['approved', 'rejected', 'cancelled']
    if new_status not in valid_statuses:
        return jsonify({'success': False, 'message': f'Status must be one of {valid_statuses}'}), 400

    booking = execute_query(
        """SELECT b.*, p.title as product_title, p.owner_id 
           FROM bookings b 
           JOIN products p ON b.product_id = p.id 
           WHERE b.id = %s""",
        (booking_id,),
        fetch_one=True
    )
    if not booking:
        return jsonify({'success': False, 'message': 'Booking not found'}), 404

    # Permission checks
    if new_status in ['approved', 'rejected']:
        if booking['owner_id'] != g.user_id:
            return jsonify({'success': False, 'message': 'Only the product owner can approve or reject bookings'}), 403
    elif new_status == 'cancelled':
        if booking['renter_id'] != g.user_id and booking['owner_id'] != g.user_id:
            return jsonify({'success': False, 'message': 'Unauthorized to cancel this booking'}), 403

    execute_query("UPDATE bookings SET status = %s WHERE id = %s", (new_status, booking_id), commit=True)

    # Notifications
    if new_status == 'approved':
        create_notification(
            booking['renter_id'],
            "Booking Approved!",
            f"Your request to rent '{booking['product_title']}' was approved! Please complete payment to activate your rental.",
            "booking",
            f"/dashboard?tab=my_rentals"
        )
    elif new_status == 'rejected':
        create_notification(
            booking['renter_id'],
            "Booking Request Declined",
            f"Your request to rent '{booking['product_title']}' was declined by the owner.",
            "booking",
            f"/dashboard?tab=my_rentals"
        )
    elif new_status == 'cancelled':
        target = booking['owner_id'] if g.user_id == booking['renter_id'] else booking['renter_id']
        create_notification(
            target,
            "Booking Cancelled",
            f"Booking #{booking_id} for '{booking['product_title']}' has been cancelled.",
            "booking",
            f"/dashboard"
        )

    return jsonify({'success': True, 'message': f'Booking status updated to {new_status}'}), 200
