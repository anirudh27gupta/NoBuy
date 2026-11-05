from flask import Blueprint, request, jsonify, g
from datetime import datetime
from db import execute_query
from utils.auth_middleware import jwt_required
from utils.notify import create_notification

returns_bp = Blueprint('returns', __name__, url_prefix='/api/returns')

@returns_bp.route('/request', methods=['POST'])
@jwt_required
def request_return():
    data = request.get_json() or {}
    booking_id = data.get('booking_id')
    renter_notes = data.get('renter_notes', '').strip()

    if not booking_id:
        return jsonify({'success': False, 'message': 'Booking ID is required'}), 400

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
        return jsonify({'success': False, 'message': 'Only the renter can initiate a return'}), 403

    if booking['status'] != 'active':
        return jsonify({'success': False, 'message': f'Cannot return booking with status "{booking["status"]}". Must be active.'}), 400

    # Check if a return record already exists
    existing_return = execute_query("SELECT id FROM returns WHERE booking_id = %s", (booking_id,), fetch_one=True)
    if existing_return:
        return jsonify({'success': False, 'message': 'A return has already been requested for this booking'}), 400

    res = execute_query(
        """INSERT INTO returns (booking_id, renter_notes, status)
           VALUES (%s, %s, 'pending_inspection')""",
        (booking_id, renter_notes or 'Item returned on time in good condition.'),
        commit=True
    )
    return_id = res['last_insert_id']

    # Update booking status to return_pending
    execute_query("UPDATE bookings SET status = 'return_pending' WHERE id = %s", (booking_id,), commit=True)

    # Notify product owner
    create_notification(
        booking['owner_id'],
        "Return Ready for Inspection",
        f"Renter {g.current_user['full_name']} has handed over '{booking['product_title']}'. Please inspect the item to release the security deposit.",
        "return",
        f"/dashboard?tab=returns"
    )

    return jsonify({
        'success': True,
        'message': 'Return request submitted. Owner notified for inspection.',
        'return_id': return_id
    }), 201

@returns_bp.route('/<int:return_id>/inspect', methods=['PUT'])
@jwt_required
def inspect_return(return_id):
    data = request.get_json() or {}
    item_condition = data.get('item_condition', 'good').lower()
    damage_fee = float(data.get('damage_fee', 0.0))
    owner_remarks = data.get('owner_remarks', '').strip()

    valid_conditions = ['excellent', 'good', 'minor_wear', 'damaged']
    if item_condition not in valid_conditions:
        return jsonify({'success': False, 'message': f'Condition must be one of {valid_conditions}'}), 400

    ret = execute_query(
        """SELECT r.*, b.product_id, b.renter_id, b.security_deposit, p.title AS product_title, p.owner_id
           FROM returns r
           JOIN bookings b ON r.booking_id = b.id
           JOIN products p ON b.product_id = p.id
           WHERE r.id = %s""",
        (return_id,),
        fetch_one=True
    )
    if not ret:
        return jsonify({'success': False, 'message': 'Return record not found'}), 404

    if ret['owner_id'] != g.user_id:
        return jsonify({'success': False, 'message': 'Only the owner of the item can perform the return inspection'}), 403

    security_deposit = float(ret['security_deposit'])
    damage_fee = max(0.0, min(damage_fee, security_deposit))
    refunded_deposit = round(security_deposit - damage_fee, 2)

    # Update return record
    execute_query(
        """UPDATE returns 
           SET inspected_at = NOW(), item_condition = %s, damage_fee = %s, 
               refunded_deposit = %s, owner_remarks = %s, status = 'completed'
           WHERE id = %s""",
        (item_condition, damage_fee, refunded_deposit, owner_remarks or 'Inspection passed. Deposit released.', return_id),
        commit=True
    )

    # Update booking status to completed
    execute_query("UPDATE bookings SET status = 'completed' WHERE id = %s", (ret['booking_id'],), commit=True)

    # Re-enable product availability for next renter
    execute_query("UPDATE products SET is_available = 1 WHERE id = %s", (ret['product_id'],), commit=True)

    # Update payment escrow status
    escrow_status = 'refunded_to_renter' if damage_fee == 0 else 'partially_released'
    execute_query(
        "UPDATE payments SET escrow_status = %s WHERE booking_id = %s",
        (escrow_status, ret['booking_id']),
        commit=True
    )

    # Notify renter
    refund_msg = f"Your return for '{ret['product_title']}' is complete. Condition: {item_condition.title()}."
    if damage_fee > 0:
        refund_msg += f" Damage fee of ₹{damage_fee:.2f} deducted. Refunded deposit: ₹{refunded_deposit:.2f}."
    else:
        refund_msg += f" Full security deposit of ₹{refunded_deposit:.2f} refunded!"

    create_notification(
        ret['renter_id'],
        "Deposit Refund & Return Completed",
        refund_msg,
        "return",
        f"/dashboard?tab=my_rentals"
    )

    return jsonify({
        'success': True,
        'message': 'Inspection completed. Security deposit refunded.',
        'refunded_deposit': refunded_deposit,
        'damage_fee': damage_fee,
        'item_condition': item_condition
    }), 200

@returns_bp.route('/booking/<int:booking_id>', methods=['GET'])
@jwt_required
def get_return_by_booking(booking_id):
    ret = execute_query(
        """SELECT r.*, b.renter_id, p.owner_id, p.title as product_title
           FROM returns r
           JOIN bookings b ON r.booking_id = b.id
           JOIN products p ON b.product_id = p.id
           WHERE r.booking_id = %s""",
        (booking_id,),
        fetch_one=True
    )
    if not ret:
        return jsonify({'success': False, 'message': 'No return record for this booking'}), 404

    if ret['renter_id'] != g.user_id and ret['owner_id'] != g.user_id:
        return jsonify({'success': False, 'message': 'Unauthorized'}), 403

    ret['damage_fee'] = float(ret['damage_fee'])
    ret['refunded_deposit'] = float(ret['refunded_deposit'])
    if ret.get('return_requested_at'):
        ret['return_requested_at'] = ret['return_requested_at'].isoformat()
    if ret.get('inspected_at'):
        ret['inspected_at'] = ret['inspected_at'].isoformat()

    return jsonify({'success': True, 'return_info': ret}), 200
