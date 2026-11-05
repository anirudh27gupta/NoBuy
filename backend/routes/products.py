import uuid
from pathlib import Path
from flask import Blueprint, request, jsonify, g, send_from_directory
from db import execute_query
from utils.auth_middleware import jwt_required, optional_jwt
from utils.notify import create_notification

products_bp = Blueprint('products', __name__, url_prefix='/api/products')
UPLOAD_DIR = Path(__file__).resolve().parents[1] / 'uploads'
MAX_IMAGE_BYTES = 5 * 1024 * 1024
IMAGE_SIGNATURES = {
    'image/jpeg': (b'\xff\xd8\xff', 'jpg'),
    'image/png': (b'\x89PNG\r\n\x1a\n', 'png'),
    'image/gif': (b'GIF8', 'gif'),
    'image/webp': (b'RIFF', 'webp'),
}


@products_bp.route('/upload', methods=['POST'])
@jwt_required
def upload_product_image():
    image = request.files.get('image')
    if not image or not image.filename:
        return jsonify({'success': False, 'message': 'Choose an image to upload'}), 400

    signature = IMAGE_SIGNATURES.get(image.mimetype)
    if not signature:
        return jsonify({'success': False, 'message': 'Use a JPEG, PNG, GIF, or WebP image'}), 400

    image_bytes = image.read(MAX_IMAGE_BYTES + 1)
    if not image_bytes or len(image_bytes) > MAX_IMAGE_BYTES:
        return jsonify({'success': False, 'message': 'Image must be smaller than 5 MB'}), 400
    if not image_bytes.startswith(signature[0]):
        return jsonify({'success': False, 'message': 'The uploaded file is not a valid image'}), 400
    if signature[1] == 'webp' and image_bytes[8:12] != b'WEBP':
        return jsonify({'success': False, 'message': 'The uploaded file is not a valid WebP image'}), 400

    UPLOAD_DIR.mkdir(parents=True, exist_ok=True)
    filename = f'{uuid.uuid4().hex}.{signature[1]}'
    (UPLOAD_DIR / filename).write_bytes(image_bytes)
    return jsonify({'success': True, 'image_url': f'/api/products/uploads/{filename}'}), 201


@products_bp.route('/uploads/<path:filename>', methods=['GET'])
def get_uploaded_image(filename):
    return send_from_directory(UPLOAD_DIR, filename, conditional=True)

@products_bp.route('', methods=['GET'])
@optional_jwt
def get_products():
    search = request.args.get('search', '').strip()
    category = request.args.get('category', '').strip()
    min_price = request.args.get('min_price', type=float)
    max_price = request.args.get('max_price', type=float)
    condition = request.args.get('condition', '').strip()
    available_only = request.args.get('available_only', 'false').lower() == 'true'
    sort = request.args.get('sort', 'newest')

    query = """
        SELECT 
            p.*,
            u.full_name AS owner_name,
            u.avatar_url AS owner_avatar,
            u.phone AS owner_phone,
            COALESCE(AVG(r.rating), 0) AS avg_rating,
            COUNT(r.id) AS review_count
        FROM products p
        JOIN users u ON p.owner_id = u.id
        LEFT JOIN reviews r ON p.id = r.product_id
        WHERE 1=1
    """
    params = []

    if search:
        query += " AND (p.title LIKE %s OR p.description LIKE %s OR p.location LIKE %s)"
        like_search = f"%{search}%"
        params.extend([like_search, like_search, like_search])

    if category and category.lower() != 'all':
        query += " AND p.category = %s"
        params.append(category)

    if min_price is not None:
        query += " AND p.daily_rate >= %s"
        params.append(min_price)

    if max_price is not None:
        query += " AND p.daily_rate <= %s"
        params.append(max_price)

    if condition and condition.lower() != 'all':
        query += " AND p.item_condition = %s"
        params.append(condition)

    if available_only:
        query += " AND p.is_available = 1"

    query += " GROUP BY p.id, u.id"

    # Sorting
    if sort == 'price_low':
        query += " ORDER BY p.daily_rate ASC"
    elif sort == 'price_high':
        query += " ORDER BY p.daily_rate DESC"
    elif sort == 'top_rated':
        query += " ORDER BY avg_rating DESC, review_count DESC"
    else:
        query += " ORDER BY p.created_at DESC"

    products = execute_query(query, tuple(params), fetch_all=True)

    # Format numbers and dates
    for p in products:
        p['daily_rate'] = float(p['daily_rate'])
        p['security_deposit'] = float(p['security_deposit'])
        p['avg_rating'] = round(float(p['avg_rating']), 1)
        p['is_available'] = bool(p['is_available'])
        if p.get('created_at'):
            p['created_at'] = p['created_at'].isoformat()
        if p.get('updated_at'):
            p['updated_at'] = p['updated_at'].isoformat()

    return jsonify({'success': True, 'count': len(products), 'products': products}), 200

@products_bp.route('/categories', methods=['GET'])
def get_categories():
    results = execute_query(
        """SELECT category, COUNT(*) as count
           FROM products
           WHERE is_available = 1
           GROUP BY category 
           ORDER BY count DESC""",
        fetch_all=True
    )
    return jsonify({'success': True, 'categories': results}), 200

@products_bp.route('/<int:product_id>', methods=['GET'])
def get_product(product_id):
    query = """
        SELECT 
            p.*,
            u.full_name AS owner_name,
            u.email AS owner_email,
            u.avatar_url AS owner_avatar,
            u.bio AS owner_bio,
            COALESCE(AVG(r.rating), 0) AS avg_rating,
            COUNT(r.id) AS review_count
        FROM products p
        JOIN users u ON p.owner_id = u.id
        LEFT JOIN reviews r ON p.id = r.product_id
        WHERE p.id = %s
        GROUP BY p.id, u.id
    """
    product = execute_query(query, (product_id,), fetch_one=True)
    if not product:
        return jsonify({'success': False, 'message': 'Product not found'}), 404

    product['daily_rate'] = float(product['daily_rate'])
    product['security_deposit'] = float(product['security_deposit'])
    product['avg_rating'] = round(float(product['avg_rating']), 1)
    product['is_available'] = bool(product['is_available'])
    if product.get('created_at'):
        product['created_at'] = product['created_at'].isoformat()
    if product.get('updated_at'):
        product['updated_at'] = product['updated_at'].isoformat()

    # Fetch reviews for this product
    reviews = execute_query(
        """SELECT r.id, r.rating, r.comment, r.created_at, u.full_name AS reviewer_name, u.avatar_url AS reviewer_avatar
           FROM reviews r
           JOIN users u ON r.reviewer_id = u.id
           WHERE r.product_id = %s
           ORDER BY r.created_at DESC""",
        (product_id,),
        fetch_all=True
    )
    for rev in reviews:
        if rev.get('created_at'):
            rev['created_at'] = rev['created_at'].isoformat()

    product['reviews'] = reviews

    return jsonify({'success': True, 'product': product}), 200

@products_bp.route('', methods=['POST'])
@jwt_required
def create_product():
    data = request.get_json() or {}
    title = data.get('title', '').strip()
    description = data.get('description', '').strip()
    category = data.get('category', '').strip()
    daily_rate = data.get('daily_rate')
    security_deposit = data.get('security_deposit', 0.0)
    item_condition = data.get('item_condition', 'Good').strip()
    location = data.get('location', '').strip() or g.current_user.get('address') or 'Local Pick-up'
    image_url = data.get('image_url', '').strip()

    if not title:
        return jsonify({'success': False, 'message': 'Title is required'}), 400
    if not description:
        return jsonify({'success': False, 'message': 'Description is required'}), 400
    if not category:
        return jsonify({'success': False, 'message': 'Category is required'}), 400
    if daily_rate is None or float(daily_rate) <= 0:
        return jsonify({'success': False, 'message': 'Daily rate must be greater than 0'}), 400

    daily_rate = float(daily_rate)
    security_deposit = float(security_deposit)

    res = execute_query(
        """INSERT INTO products 
           (owner_id, title, description, category, daily_rate, security_deposit, item_condition, location, image_url, is_available)
           VALUES (%s, %s, %s, %s, %s, %s, %s, %s, %s, 1)""",
        (g.user_id, title, description, category, daily_rate, security_deposit, item_condition, location, image_url),
        commit=True
    )
    product_id = res['last_insert_id']

    create_notification(
        g.user_id,
        "Listing Published!",
        f"Your item '{title}' is now live and available for rent.",
        "product",
        f"/product/{product_id}"
    )

    return jsonify({
        'success': True,
        'message': 'Product listed successfully',
        'product_id': product_id
    }), 201

@products_bp.route('/<int:product_id>', methods=['PUT'])
@jwt_required
def update_product(product_id):
    product = execute_query("SELECT * FROM products WHERE id = %s", (product_id,), fetch_one=True)
    if not product:
        return jsonify({'success': False, 'message': 'Product not found'}), 404
    if product['owner_id'] != g.user_id:
        return jsonify({'success': False, 'message': 'You are not authorized to edit this product'}), 403

    data = request.get_json() or {}
    title = data.get('title', product['title']).strip()
    description = data.get('description', product['description']).strip()
    category = data.get('category', product['category']).strip()
    daily_rate = float(data.get('daily_rate', product['daily_rate']))
    security_deposit = float(data.get('security_deposit', product['security_deposit']))
    item_condition = data.get('item_condition', product['item_condition']).strip()
    location = data.get('location', product['location']).strip()
    image_url = data.get('image_url', product['image_url'])
    is_available = 1 if data.get('is_available', product['is_available']) else 0

    execute_query(
        """UPDATE products 
           SET title=%s, description=%s, category=%s, daily_rate=%s, security_deposit=%s, 
               item_condition=%s, location=%s, image_url=%s, is_available=%s
           WHERE id=%s""",
        (title, description, category, daily_rate, security_deposit, item_condition, location, image_url, is_available, product_id),
        commit=True
    )

    return jsonify({'success': True, 'message': 'Product updated successfully'}), 200

@products_bp.route('/<int:product_id>', methods=['DELETE'])
@jwt_required
def delete_product(product_id):
    product = execute_query("SELECT * FROM products WHERE id = %s", (product_id,), fetch_one=True)
    if not product:
        return jsonify({'success': False, 'message': 'Product not found'}), 404
    if product['owner_id'] != g.user_id:
        return jsonify({'success': False, 'message': 'You can only delete your own listings'}), 403

    # Preserve completed rental history and linked payment/review records.
    existing_booking = execute_query(
        "SELECT id FROM bookings WHERE product_id = %s LIMIT 1",
        (product_id,),
        fetch_one=True
    )
    if existing_booking:
        return jsonify({'success': False, 'message': 'This listing has rental history and cannot be deleted. Mark it unavailable instead.'}), 400

    execute_query("DELETE FROM products WHERE id = %s", (product_id,), commit=True)
    return jsonify({'success': True, 'message': 'Product removed successfully'}), 200

@products_bp.route('/my-listings', methods=['GET'])
@jwt_required
def get_my_listings():
    query = """
        SELECT 
            p.*,
            (SELECT COUNT(*) FROM bookings b WHERE b.product_id = p.id AND b.status = 'active') as active_rentals,
            (SELECT COUNT(*) FROM bookings b WHERE b.product_id = p.id) as total_bookings,
            COALESCE((SELECT SUM(b.rent_amount) FROM bookings b WHERE b.product_id = p.id AND b.status IN ('active', 'completed')), 0) as total_revenue,
            COALESCE(AVG(r.rating), 0) AS avg_rating,
            COUNT(r.id) AS review_count
        FROM products p
        LEFT JOIN reviews r ON p.id = r.product_id
        WHERE p.owner_id = %s
        GROUP BY p.id
        ORDER BY p.created_at DESC
    """
    listings = execute_query(query, (g.user_id,), fetch_all=True)
    for l in listings:
        l['daily_rate'] = float(l['daily_rate'])
        l['security_deposit'] = float(l['security_deposit'])
        l['total_revenue'] = float(l['total_revenue'])
        l['avg_rating'] = round(float(l['avg_rating']), 1)
        l['is_available'] = bool(l['is_available'])
        if l.get('created_at'):
            l['created_at'] = l['created_at'].isoformat()
    return jsonify({'success': True, 'listings': listings}), 200
