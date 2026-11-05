from flask import Blueprint, jsonify, g
from db import execute_query
from utils.auth_middleware import jwt_required

dashboard_bp = Blueprint('dashboard', __name__, url_prefix='/api/dashboard')

@dashboard_bp.route('/summary', methods=['GET'])
@jwt_required
def get_dashboard_summary():
    user_id = g.user_id

    # Renter Statistics
    renter_stats = execute_query(
        """SELECT 
            COUNT(CASE WHEN status = 'active' THEN 1 END) AS active_rentals_count,
            COUNT(CASE WHEN status = 'pending' THEN 1 END) AS pending_bookings_count,
            COUNT(CASE WHEN status = 'completed' THEN 1 END) AS completed_rentals_count,
            COALESCE(SUM(CASE WHEN status IN ('active', 'completed') THEN rent_amount ELSE 0 END), 0) AS total_rent_spent,
            COALESCE(SUM(CASE WHEN status = 'active' THEN security_deposit ELSE 0 END), 0) AS active_deposits_held
        FROM bookings
        WHERE renter_id = %s""",
        (user_id,),
        fetch_one=True
    )

    # Calculate estimated money saved vs buying retail (rental items save ~ 75%-85% over purchasing new)
    total_spent = float(renter_stats['total_rent_spent'])
    estimated_retail_saved = round(total_spent * 3.5, 2)

    # Owner / Lender Statistics
    owner_stats = execute_query(
        """SELECT 
            (SELECT COUNT(*) FROM products WHERE owner_id = %s) AS my_listings_count,
            (SELECT COUNT(*) FROM products WHERE owner_id = %s AND is_available = 1) AS available_listings_count,
            (SELECT COUNT(*) FROM bookings b JOIN products p ON b.product_id = p.id WHERE p.owner_id = %s AND b.status = 'pending') AS incoming_requests_count,
            (SELECT COUNT(*) FROM bookings b JOIN products p ON b.product_id = p.id WHERE p.owner_id = %s AND b.status = 'active') AS actively_rented_out_count,
            (SELECT COUNT(*) FROM returns r JOIN bookings b ON r.booking_id = b.id JOIN products p ON b.product_id = p.id WHERE p.owner_id = %s AND r.status = 'pending_inspection') AS pending_inspections_count,
            COALESCE((SELECT SUM(b.rent_amount) FROM bookings b JOIN products p ON b.product_id = p.id WHERE p.owner_id = %s AND b.status IN ('active', 'completed')), 0) AS total_earnings
        """,
        (user_id, user_id, user_id, user_id, user_id, user_id),
        fetch_one=True
    )

    # Negotiation counts
    neg_stats = execute_query(
        """SELECT 
            COUNT(CASE WHEN renter_id = %s AND status IN ('pending', 'countered') THEN 1 END) AS active_offers_sent,
            COUNT(CASE WHEN owner_id = %s AND status = 'pending' THEN 1 END) AS pending_offers_received
        FROM negotiations
        WHERE renter_id = %s OR owner_id = %s""",
        (user_id, user_id, user_id, user_id),
        fetch_one=True
    )

    return jsonify({
        'success': True,
        'renter_metrics': {
            'active_rentals': renter_stats['active_rentals_count'],
            'pending_bookings': renter_stats['pending_bookings_count'],
            'completed_rentals': renter_stats['completed_rentals_count'],
            'total_spent': total_spent,
            'active_deposits_held': float(renter_stats['active_deposits_held']),
            'estimated_savings': estimated_retail_saved,
            'active_offers_sent': neg_stats['active_offers_sent']
        },
        'owner_metrics': {
            'total_listings': owner_stats['my_listings_count'],
            'available_listings': owner_stats['available_listings_count'],
            'incoming_requests': owner_stats['incoming_requests_count'],
            'items_on_rent': owner_stats['actively_rented_out_count'],
            'pending_inspections': owner_stats['pending_inspections_count'],
            'total_earnings': float(owner_stats['total_earnings']),
            'pending_offers_received': neg_stats['pending_offers_received']
        }
    }), 200
