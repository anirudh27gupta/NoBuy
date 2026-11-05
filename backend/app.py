import logging
from flask import Flask, jsonify
from flask_cors import CORS
from config import Config
from db import init_pool

# Import blueprints
from routes.auth import auth_bp
from routes.products import products_bp
from routes.bookings import bookings_bp
from routes.negotiations import negotiations_bp
from routes.payments import payments_bp
from routes.returns import returns_bp
from routes.reviews import reviews_bp
from routes.dashboard import dashboard_bp
from routes.notifications import notifications_bp

logging.basicConfig(level=logging.INFO, format='%(asctime)s [%(levelname)s] %(message)s')
logger = logging.getLogger('nobuy')

def create_app():
    app = Flask(__name__)
    app.config.from_object(Config)
    app.config['MAX_CONTENT_LENGTH'] = 6 * 1024 * 1024

    # Enable CORS for frontend
    CORS(app, resources={r"/api/*": {"origins": "*"}}, supports_credentials=True)

    # Initialize DB connection pool
    try:
        init_pool()
    except Exception as e:
        logger.warning(f"Initial DB pool creation postponed: {e}")

    # Register blueprints
    app.register_blueprint(auth_bp)
    app.register_blueprint(products_bp)
    app.register_blueprint(bookings_bp)
    app.register_blueprint(negotiations_bp)
    app.register_blueprint(payments_bp)
    app.register_blueprint(returns_bp)
    app.register_blueprint(reviews_bp)
    app.register_blueprint(dashboard_bp)
    app.register_blueprint(notifications_bp)

    @app.route('/api/health', methods=['GET'])
    def health():
        try:
            from db import execute_query
            execute_query('SELECT 1', fetch_one=True)
            return jsonify({
                'status': 'healthy',
                'database_status': 'connected',
                'platform': 'No-Buy Peer-to-Peer Rental API',
                'database': Config.MYSQL_DB,
                'port': 5000
            }), 200
        except Exception:
            logger.exception('Database health check failed')
            return jsonify({
                'status': 'unhealthy',
                'database_status': 'disconnected',
                'database': Config.MYSQL_DB
            }), 503

    @app.errorhandler(404)
    def not_found(e):
        return jsonify({'success': False, 'message': 'Endpoint not found'}), 404

    @app.errorhandler(500)
    def internal_error(e):
        logger.error(f"Internal server error: {e}")
        return jsonify({'success': False, 'message': 'Internal server error'}), 500

    @app.errorhandler(413)
    def request_too_large(e):
        return jsonify({'success': False, 'message': 'Request is too large. Product photos must be 5 MB or smaller.'}), 413

    return app

app = create_app()

if __name__ == '__main__':
    print("Starting No-Buy Backend on http://127.0.0.1:5000...")
    app.run(host='0.0.0.0', port=5000, debug=True)
