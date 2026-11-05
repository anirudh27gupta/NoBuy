import os
import sys
from werkzeug.security import generate_password_hash
from config import Config
from db import get_connection

def init_database():
    print(f"Connecting to MySQL server at {Config.MYSQL_HOST}:{Config.MYSQL_PORT}...")
    try:
        if not Config.MYSQL_DB.replace('_', '').isalnum():
            raise ValueError('MYSQL_DB must contain only letters, digits, and underscores')
        # Step 1: Create Database if not exists
        server_conn = get_connection(use_database=False)
        server_cursor = server_conn.cursor()
        print(f"Creating database '{Config.MYSQL_DB}' if not exists...")
        server_cursor.execute("SHOW DATABASES LIKE %s", (Config.MYSQL_DB,))
        database_exists = server_cursor.fetchone() is not None
        if not database_exists:
            server_cursor.execute(f"CREATE DATABASE `{Config.MYSQL_DB}` CHARACTER SET utf8mb4 COLLATE utf8mb4_general_ci")
        server_cursor.close()
        server_conn.close()
        print(f"Database '{Config.MYSQL_DB}' verified.")
    except Exception as e:
        print(f"Failed to connect to MySQL server: {e}")
        return False

    # Step 2: Run schema tables
    schema_path = os.path.join(os.path.dirname(__file__), 'schema.sql')
    if not os.path.exists(schema_path):
        print(f"Schema file not found at {schema_path}")
        return False

    with open(schema_path, 'r', encoding='utf-8') as f:
        schema_sql = f.read()

    db_conn = get_connection(use_database=True)
    cursor = db_conn.cursor()

    # Split SQL commands by semicolon
    statements = [stmt.strip() for stmt in schema_sql.split(';') if stmt.strip()]
    for stmt in statements:
        # Strip leading SQL comments so CREATE DATABASE and USE are reliably skipped.
        executable_sql = '\n'.join(
            line for line in stmt.splitlines()
            if not line.lstrip().startswith('--')
        ).strip()
        if not executable_sql:
            continue
        # The database was selected by get_connection; applying these again also
        # requires privileges beyond the app's schema-level grant.
        if executable_sql.upper().startswith("CREATE DATABASE") or executable_sql.upper().startswith("USE "):
            continue
        try:
            cursor.execute(executable_sql)
        except Exception as e:
            db_conn.rollback()
            cursor.close()
            db_conn.close()
            print(f"Error creating database schema: {e}\nQuery: {executable_sql[:160]}...")
            return False

    # Also apply this constraint to databases created before the current schema.
    cursor.execute(
        """SELECT COUNT(*) FROM information_schema.statistics
           WHERE table_schema = %s AND table_name = 'payments'
             AND column_name = 'booking_id' AND non_unique = 0""",
        (Config.MYSQL_DB,)
    )
    has_unique_payment_booking = cursor.fetchone()[0] > 0
    if not has_unique_payment_booking:
        cursor.execute(
            """SELECT COUNT(*) FROM (
                   SELECT booking_id FROM payments GROUP BY booking_id HAVING COUNT(*) > 1
               ) AS duplicate_payments"""
        )
        if cursor.fetchone()[0] > 0:
            cursor.close()
            db_conn.close()
            print("Cannot add the one-payment-per-booking rule: duplicate payment rows exist. Resolve them in Workbench first.")
            return False
        cursor.execute("ALTER TABLE payments ADD UNIQUE INDEX uq_payments_booking_id (booking_id)")

    db_conn.commit()
    print("Schema tables created successfully.")

    # Step 3: Seed initial data if users table is empty
    cursor.execute("SELECT COUNT(*) FROM users;")
    user_count = cursor.fetchone()[0]

    if user_count == 0 and os.environ.get('SEED_DEMO_DATA', '').lower() == 'true':
        print("Seeding initial demonstration users, products, and activity...")
        pwd_hash = generate_password_hash('password123')

        users_data = [
            ("Aanya Sharma", "aanya@example.com", pwd_hash, "+91 98765 43210", "Pune, Maharashtra", "https://images.unsplash.com/photo-1494790108377-be9c29b29330?w=150", "Outdoor enthusiast and hobbyist photographer. Passionate about sustainable circular economy."),
            ("Arjun Mehta", "arjun@example.com", pwd_hash, "+91 98765 43211", "Bengaluru, Karnataka", "https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?w=150", "Tech collector & audio engineer. Lending premium audio and video gear for gigs and events."),
            ("Kavya Nair", "kavya@example.com", pwd_hash, "+91 98765 43212", "Kochi, Kerala", "https://images.unsplash.com/photo-1534528741775-53994a69daeb?w=150", "Camping explorer and weekend DIY builder. Love sharing gear and meeting fellow hobbyists."),
            ("Rohan Verma", "rohan@example.com", pwd_hash, "+91 98765 43213", "Hyderabad, Telangana", "https://images.unsplash.com/photo-1500648767791-00dcc994a43e?w=150", "Maker, VR creator, and drone pilot. Rent my tools and drones when not in production.")
        ]

        for user in users_data:
            cursor.execute(
                "INSERT INTO users (full_name, email, password_hash, phone, address, avatar_url, bio) VALUES (%s, %s, %s, %s, %s, %s, %s)",
                user
            )
        db_conn.commit()
        print("Demo users seeded.")

        # Seed products
        products_data = [
            (
                1, "Sony Alpha A7 IV Mirrorless Camera Kit",
                "Full-frame 33MP hybrid camera with 28-70mm lens, 2x batteries, charger, and 128GB high-speed SD card. Perfect for weddings, events, and indie film shoots.",
                "Cameras & Video", 4000.00, 20000.00, "Like New", "Pune, Maharashtra",
                "https://images.unsplash.com/photo-1516035069371-29a1b244cc32?w=800", 1
            ),
            (
                2, "DJI Mini 4 Pro Drone Fly More Combo",
                "Ultra-light 249g drone featuring 4K/60fps HDR video, omnidirectional obstacle sensing, and 3 intelligent flight batteries (up to 90 min flight time). Includes RC 2 controller with built-in screen.",
                "Cameras & Video", 3500.00, 18000.00, "Like New", "Bengaluru, Karnataka",
                "https://images.unsplash.com/photo-1508614589041-895b88991e3e?w=800", 1
            ),
            (
                3, "Coleman 6-Person WeatherMaster Dark-Room Tent",
                "Spacious family camping tent featuring patented WeatherTec system, screened porch, and Dark Room technology blocking 90% of sunlight. Easy 15-minute setup.",
                "Outdoor & Camping", 2000.00, 6500.00, "Good", "Kochi, Kerala",
                "https://images.unsplash.com/photo-1504280390367-361c6d9f38f4?w=800", 1
            ),
            (
                4, "DeWalt 20V Max Brushless 5-Tool Combo Kit",
                "Professional-grade kit including hammer drill, impact driver, circular saw, reciprocating saw, work light, two 4.0Ah batteries, and rugged contractor bag.",
                "Tools & DIY", 2500.00, 12000.00, "Good", "Hyderabad, Telangana",
                "https://images.unsplash.com/photo-1504148455328-c376907d081c?w=800", 1
            ),
            (
                2, "JBL PartyBox 310 Portable Bluetooth Speaker",
                "Massive 240W sound with dynamic synchronized light show, dual mic/guitar inputs, built-in wheels and handle, splashproof (IPX4), 18hr rechargeable battery.",
                "Party & Events", 3000.00, 15000.00, "Like New", "Bengaluru, Karnataka",
                "https://images.unsplash.com/photo-1545454675-3531b543be5d?w=800", 1
            ),
            (
                4, "Meta Quest 3 512GB VR & Mixed Reality Headset",
                "Breakthrough mixed reality headset with 4K+ Infinite Display, Touch Plus controllers, elite strap for comfort, and 15+ preloaded VR party and adventure games.",
                "Electronics", 2700.00, 16500.00, "Brand New", "Hyderabad, Telangana",
                "https://images.unsplash.com/photo-1622979135225-d2ba269bc1df?w=800", 1
            ),
            (
                3, "Garmin Edge 1040 Solar Cycling Computer",
                "Ultimate GPS bike computer with solar charging, advanced cycling dynamics, turn-by-turn navigation, and multi-band GNSS accuracy.",
                "Sports & Fitness", 1800.00, 10000.00, "Good", "Kochi, Kerala",
                "https://images.unsplash.com/photo-1485965120184-e220f721d03e?w=800", 1
            ),
            (
                1, "Anker Nebula Capsule 3 Laser 1080p Smart Projector",
                "Ultra-portable laser projector with Google TV, Dolby Digital audio, autofocus, 2.5 hour built-in battery, and 100-inch foldable projection screen included.",
                "Party & Events", 2300.00, 11500.00, "Like New", "Pune, Maharashtra",
                "https://images.unsplash.com/photo-1517604931442-7e0c8ed2963c?w=800", 1
            )
        ]

        for prod in products_data:
            cursor.execute(
                """INSERT INTO products 
                   (owner_id, title, description, category, daily_rate, security_deposit, item_condition, location, image_url, is_available) 
                   VALUES (%s, %s, %s, %s, %s, %s, %s, %s, %s, %s)""",
                prod
            )
        db_conn.commit()
        print("Demo products seeded.")

        # Seed sample completed booking + review to show rating data
        cursor.execute(
            """INSERT INTO bookings 
               (product_id, renter_id, start_date, end_date, total_days, daily_rate, rent_amount, security_deposit, total_amount, status, is_negotiated)
               VALUES (1, 2, '2026-09-01', '2026-09-04', 3, 4000.00, 12000.00, 20000.00, 32000.00, 'completed', 0)"""
        )
        booking_id = cursor.lastrowid

        cursor.execute(
            """INSERT INTO payments
               (booking_id, user_id, transaction_id, payment_method, rent_amount, deposit_amount, total_amount, status, escrow_status, card_last4)
               VALUES (%s, 2, 'TXN-DEMO-9901', 'card', 12000.00, 20000.00, 32000.00, 'completed', 'refunded_to_renter', '4242')""",
            (booking_id,)
        )

        cursor.execute(
            """INSERT INTO returns
               (booking_id, return_requested_at, inspected_at, item_condition, damage_fee, refunded_deposit, owner_remarks, status)
               VALUES (%s, '2026-09-04 18:00:00', '2026-09-04 19:30:00', 'excellent', 0.00, 20000.00, 'Returned in immaculate condition. Thanks Arjun!', 'completed')""",
            (booking_id,)
        )

        cursor.execute(
            """INSERT INTO reviews
               (booking_id, product_id, reviewer_id, target_user_id, rating, comment)
               VALUES (%s, 1, 2, 1, 5, 'The Sony A7 IV was in pristine shape with fully charged batteries and clean sensor. Aanya was super responsive and helpful!')""",
            (booking_id,)
        )

        # Seed an active booking for Rohan renting the DJI drone from Arjun
        cursor.execute(
            """INSERT INTO bookings 
               (product_id, renter_id, start_date, end_date, total_days, daily_rate, rent_amount, security_deposit, total_amount, status, is_negotiated)
               VALUES (2, 4, '2026-10-08', '2026-10-12', 4, 3500.00, 14000.00, 18000.00, 32000.00, 'active', 0)"""
        )
        active_booking_id = cursor.lastrowid
        cursor.execute(
            """INSERT INTO payments
               (booking_id, user_id, transaction_id, payment_method, rent_amount, deposit_amount, total_amount, status, escrow_status, upi_id)
               VALUES (%s, 4, 'TXN-DEMO-9902', 'upi', 14000.00, 18000.00, 32000.00, 'completed', 'held', 'rohan@upi')""",
            (active_booking_id,)
        )

        # Seed sample negotiation for Camping Tent
        cursor.execute(
            """INSERT INTO negotiations
               (booking_id, product_id, renter_id, owner_id, original_daily_rate, proposed_daily_rate, counter_daily_rate, status, renter_message, owner_message, last_actor_id)
               VALUES (NULL, 3, 1, 3, 2000.00, 1600.00, 1800.00, 'countered', 'Hi Kavya! Planning a 5-day hiking trip. Could you do ₹1,600/day?', 'Hey Aanya! I can meet you in the middle at ₹1,800/day. Deal?', 3)"""
        )

        # Seed sample notifications
        cursor.execute(
            """INSERT INTO notifications (user_id, title, message, type, link) VALUES 
               (1, 'Welcome to No-Buy!', 'Start exploring gear to rent or list your own equipment today.', 'general', '/catalog'),
               (1, 'Counter-Offer Received', 'Kavya counter-offered ₹1,800/day for Coleman 6-Person Tent.', 'negotiation', '/dashboard?tab=negotiations')"""
        )

        db_conn.commit()
        print("Initial demonstration activity & relations created successfully.")

    cursor.close()
    db_conn.close()
    return True

if __name__ == '__main__':
    success = init_database()
    if success:
        print("Database initialization complete.")
    else:
        print("Database initialization failed.")
        sys.exit(1)
