from flask import Blueprint, request, jsonify, g
import uuid
from datetime import datetime
from db import execute_query
from utils.auth_middleware import jwt_required
from utils.notify import create_notification

payments_bp = Blueprint('payments', __name__, url_prefix='/api/payments')

@payments_bp.route('/checkout', methods=['POST'])
@jwt_required
def process_payment():
    data = request.get_json() or {}
    booking_id = data.get('booking_id')
    payment_method = data.get('payment_method', 'card').lower()
    card_last4 = data.get('card_last4', '4242')
    upi_id = data.get('upi_id', 'user@simulatedupi')

    if not booking_id:
        return jsonify({'success': False, 'message': 'Booking ID is required'}), 400

    if payment_method not in ['card', 'upi', 'netbanking', 'wallet']:
        return jsonify({'success': False, 'message': 'Invalid payment method'}), 400

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
        return jsonify({'success': False, 'message': 'Only the renter can pay for this booking'}), 403

    if booking['status'] != 'approved':
        return jsonify({'success': False, 'message': 'The owner must approve this booking before checkout'}), 400

    existing_payment = execute_query(
        "SELECT id FROM payments WHERE booking_id = %s",
        (booking_id,),
        fetch_one=True
    )
    if existing_payment:
        return jsonify({'success': False, 'message': 'This booking already has a payment record'}), 409

    # Generate unique simulated transaction reference
    txn_ref = f"TXN-NOBUY-{uuid.uuid4().hex[:10].upper()}"

    rent_amt = float(booking['rent_amount'])
    dep_amt = float(booking['security_deposit'])
    tot_amt = float(booking['total_amount'])

    # Insert payment record into payments table
    res = execute_query(
        """INSERT INTO payments 
           (booking_id, user_id, transaction_id, payment_method, rent_amount, deposit_amount, total_amount, status, escrow_status, card_last4, upi_id)
           VALUES (%s, %s, %s, %s, %s, %s, %s, 'completed', 'held', %s, %s)""",
        (booking_id, g.user_id, txn_ref, payment_method, rent_amt, dep_amt, tot_amt, card_last4, upi_id),
        commit=True
    )
    payment_id = res['last_insert_id']

    # Update booking status to active
    execute_query("UPDATE bookings SET status = 'active' WHERE id = %s", (booking_id,), commit=True)

    # Notify Owner and Renter
    create_notification(
        booking['owner_id'],
        "Payment Received & Rental Active",
        f"Payment of ₹{tot_amt:.2f} for '{booking['product_title']}' has been confirmed. Security deposit (₹{dep_amt:.2f}) is held safely in escrow.",
        "payment",
        f"/dashboard?tab=requests"
    )

    create_notification(
        g.user_id,
        "Rental Activated!",
        f"Your payment of ₹{tot_amt:.2f} for '{booking['product_title']}' was successful. Enjoy your rental!",
        "payment",
        f"/dashboard?tab=my_rentals"
    )

    return jsonify({
        'success': True,
        'message': 'Payment processed successfully (Simulated)',
        'transaction_id': txn_ref,
        'payment_id': payment_id,
        'booking_id': booking_id,
        'total_amount': tot_amt,
        'escrow_status': 'held'
    }), 200

@payments_bp.route('/receipt/<int:payment_id>', methods=['GET'])
@jwt_required
def get_receipt(payment_id):
    query = """
        SELECT 
            pay.*,
            b.start_date,
            b.end_date,
            b.total_days,
            b.daily_rate,
            p.title AS product_title,
            p.category AS product_category,
            renter.full_name AS renter_name,
            renter.email AS renter_email,
            owner.full_name AS owner_name,
            owner.email AS owner_email
        FROM payments pay
        JOIN bookings b ON pay.booking_id = b.id
        JOIN products p ON b.product_id = p.id
        JOIN users renter ON pay.user_id = renter.id
        JOIN users owner ON p.owner_id = owner.id
        WHERE pay.id = %s
    """
    receipt = execute_query(query, (payment_id,), fetch_one=True)
    if not receipt:
        return jsonify({'success': False, 'message': 'Payment record not found'}), 404

    receipt['rent_amount'] = float(receipt['rent_amount'])
    receipt['deposit_amount'] = float(receipt['deposit_amount'])
    receipt['total_amount'] = float(receipt['total_amount'])
    receipt['daily_rate'] = float(receipt['daily_rate'])
    if receipt.get('start_date'):
        receipt['start_date'] = receipt['start_date'].isoformat()
    if receipt.get('end_date'):
        receipt['end_date'] = receipt['end_date'].isoformat()
    if receipt.get('paid_at'):
        receipt['paid_at'] = receipt['paid_at'].isoformat()

    return jsonify({'success': True, 'receipt': receipt}), 200

@payments_bp.route('/my-payments', methods=['GET'])
@jwt_required
def get_my_payments():
    query = """
        SELECT 
            pay.*,
            b.id AS booking_id,
            p.title AS product_title,
            p.image_url AS product_image
        FROM payments pay
        JOIN bookings b ON pay.booking_id = b.id
        JOIN products p ON b.product_id = p.id
        WHERE pay.user_id = %s
        ORDER BY pay.paid_at DESC
    """
    payments = execute_query(query, (g.user_id,), fetch_all=True)
    for pay in payments:
        pay['rent_amount'] = float(pay['rent_amount'])
        pay['deposit_amount'] = float(pay['deposit_amount'])
        pay['total_amount'] = float(pay['total_amount'])
        if pay.get('paid_at'):
            pay['paid_at'] = pay['paid_at'].isoformat()
    return jsonify({'success': True, 'payments': payments}), 200
