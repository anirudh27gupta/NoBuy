from flask import Blueprint, request, jsonify, g
from db import execute_query
from utils.auth_middleware import jwt_required
from utils.notify import create_notification

negotiations_bp = Blueprint('negotiations', __name__, url_prefix='/api/negotiations')

@negotiations_bp.route('', methods=['POST'])
@jwt_required
def create_negotiation():
    data = request.get_json() or {}
    product_id = data.get('product_id')
    booking_id = data.get('booking_id')  # optional
    proposed_daily_rate = data.get('proposed_daily_rate')
    renter_message = data.get('renter_message', '').strip()

    if not product_id or proposed_daily_rate is None or float(proposed_daily_rate) <= 0:
        return jsonify({'success': False, 'message': 'Product and valid proposed daily rate are required'}), 400

    product = execute_query("SELECT * FROM products WHERE id = %s", (product_id,), fetch_one=True)
    if not product:
        return jsonify({'success': False, 'message': 'Product not found'}), 404

    if product['owner_id'] == g.user_id:
        return jsonify({'success': False, 'message': 'You cannot negotiate on your own item'}), 400

    proposed_daily_rate = float(proposed_daily_rate)
    original_daily_rate = float(product['daily_rate'])

    res = execute_query(
        """INSERT INTO negotiations 
           (booking_id, product_id, renter_id, owner_id, original_daily_rate, proposed_daily_rate, status, renter_message, last_actor_id)
           VALUES (%s, %s, %s, %s, %s, %s, 'pending', %s, %s)""",
        (booking_id, product_id, g.user_id, product['owner_id'], original_daily_rate, proposed_daily_rate, renter_message, g.user_id),
        commit=True
    )
    negotiation_id = res['last_insert_id']

    create_notification(
        product['owner_id'],
        "New Bargain Offer!",
        f"{g.current_user['full_name']} proposed ₹{proposed_daily_rate:.2f}/day (Original: ₹{original_daily_rate:.2f}/day) for '{product['title']}'.",
        "negotiation",
        f"/dashboard?tab=negotiations"
    )

    return jsonify({
        'success': True,
        'message': 'Offer sent to owner successfully',
        'negotiation_id': negotiation_id
    }), 201

@negotiations_bp.route('', methods=['GET'])
@jwt_required
def get_user_negotiations():
    query = """
        SELECT 
            n.*,
            p.title AS product_title,
            p.image_url AS product_image,
            p.category AS product_category,
            renter.full_name AS renter_name,
            renter.avatar_url AS renter_avatar,
            owner.full_name AS owner_name,
            owner.avatar_url AS owner_avatar
        FROM negotiations n
        JOIN products p ON n.product_id = p.id
        JOIN users renter ON n.renter_id = renter.id
        JOIN users owner ON n.owner_id = owner.id
        WHERE n.renter_id = %s OR n.owner_id = %s
        ORDER BY n.updated_at DESC
    """
    negs = execute_query(query, (g.user_id, g.user_id), fetch_all=True)
    for n in negs:
        n['original_daily_rate'] = float(n['original_daily_rate'])
        n['proposed_daily_rate'] = float(n['proposed_daily_rate'])
        if n.get('counter_daily_rate') is not None:
            n['counter_daily_rate'] = float(n['counter_daily_rate'])
        if n.get('created_at'):
            n['created_at'] = n['created_at'].isoformat()
        if n.get('updated_at'):
            n['updated_at'] = n['updated_at'].isoformat()
    return jsonify({'success': True, 'negotiations': negs}), 200

@negotiations_bp.route('/<int:negotiation_id>/respond', methods=['PUT'])
@jwt_required
def respond_negotiation(negotiation_id):
    neg = execute_query(
        """SELECT n.*, p.title AS product_title 
           FROM negotiations n 
           JOIN products p ON n.product_id = p.id 
           WHERE n.id = %s""",
        (negotiation_id,),
        fetch_one=True
    )
    if not neg:
        return jsonify({'success': False, 'message': 'Negotiation not found'}), 404

    is_owner = (g.user_id == neg['owner_id'])
    is_renter = (g.user_id == neg['renter_id'])

    if not is_owner and not is_renter:
        return jsonify({'success': False, 'message': 'Unauthorized'}), 403

    data = request.get_json() or {}
    action = data.get('action', '').lower()
    counter_rate = data.get('counter_rate')
    message = data.get('message', '').strip()

    if action not in ['accept', 'counter', 'reject']:
        return jsonify({'success': False, 'message': 'Action must be accept, counter, or reject'}), 400

    if action == 'accept':
        final_rate = float(neg['counter_daily_rate']) if (neg['status'] == 'countered' and is_renter) else float(neg['proposed_daily_rate'])

        execute_query(
            "UPDATE negotiations SET status = 'accepted', last_actor_id = %s, updated_at = NOW() WHERE id = %s",
            (g.user_id, negotiation_id),
            commit=True
        )

        # If a booking is tied, update the rate and recalculate totals!
        if neg['booking_id']:
            booking = execute_query("SELECT total_days, security_deposit FROM bookings WHERE id = %s", (neg['booking_id'],), fetch_one=True)
            if booking:
                new_rent = round(final_rate * booking['total_days'], 2)
                new_total = round(new_rent + float(booking['security_deposit']), 2)
                execute_query(
                    """UPDATE bookings 
                       SET daily_rate = %s, rent_amount = %s, total_amount = %s, is_negotiated = 1 
                       WHERE id = %s""",
                    (final_rate, new_rent, new_total, neg['booking_id']),
                    commit=True
                )

        target_user = neg['renter_id'] if is_owner else neg['owner_id']
        create_notification(
            target_user,
            "Offer Accepted!",
            f"The rental offer for '{neg['product_title']}' was accepted at ₹{final_rate:.2f}/day!",
            "negotiation",
            f"/dashboard?tab=negotiations"
        )

        return jsonify({'success': True, 'message': 'Offer accepted', 'final_rate': final_rate}), 200

    elif action == 'counter':
        if counter_rate is None or float(counter_rate) <= 0:
            return jsonify({'success': False, 'message': 'Valid counter rate is required'}), 400

        counter_rate = float(counter_rate)
        execute_query(
            """UPDATE negotiations 
               SET status = 'countered', counter_daily_rate = %s, owner_message = %s, last_actor_id = %s, updated_at = NOW()
               WHERE id = %s""",
            (counter_rate, message, g.user_id, negotiation_id),
            commit=True
        )

        target_user = neg['renter_id'] if is_owner else neg['owner_id']
        create_notification(
            target_user,
            "Counter-Offer Received",
            f"A counter-offer of ₹{counter_rate:.2f}/day was made for '{neg['product_title']}'.",
            "negotiation",
            f"/dashboard?tab=negotiations"
        )

        return jsonify({'success': True, 'message': 'Counter-offer sent', 'counter_rate': counter_rate}), 200

    elif action == 'reject':
        execute_query(
            "UPDATE negotiations SET status = 'rejected', last_actor_id = %s, updated_at = NOW() WHERE id = %s",
            (g.user_id, negotiation_id),
            commit=True
        )

        target_user = neg['renter_id'] if is_owner else neg['owner_id']
        create_notification(
            target_user,
            "Offer Declined",
            f"The offer for '{neg['product_title']}' was declined.",
            "negotiation",
            f"/dashboard?tab=negotiations"
        )

        return jsonify({'success': True, 'message': 'Offer declined'}), 200
