-- ==========================================================
-- No-Buy Database Schema
-- Database: nobuy_db
-- Peer-to-Peer Rental, Bargaining & Return Inspection Platform
-- ==========================================================

CREATE DATABASE IF NOT EXISTS nobuy_db CHARACTER SET utf8mb4 COLLATE utf8mb4_general_ci;
USE nobuy_db;

-- 1. USERS TABLE (Unified Account for Renting & Listing)
CREATE TABLE IF NOT EXISTS users (
    id INT AUTO_INCREMENT PRIMARY KEY,
    full_name VARCHAR(120) NOT NULL,
    email VARCHAR(150) NOT NULL UNIQUE,
    password_hash VARCHAR(255) NOT NULL,
    phone VARCHAR(30) DEFAULT NULL,
    address TEXT DEFAULT NULL,
    avatar_url VARCHAR(500) DEFAULT NULL,
    bio TEXT DEFAULT NULL,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    INDEX idx_user_email (email)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_general_ci;

-- 2. PRODUCTS TABLE
CREATE TABLE IF NOT EXISTS products (
    id INT AUTO_INCREMENT PRIMARY KEY,
    owner_id INT NOT NULL,
    title VARCHAR(200) NOT NULL,
    description TEXT NOT NULL,
    category VARCHAR(80) NOT NULL,
    daily_rate DECIMAL(10, 2) NOT NULL,
    security_deposit DECIMAL(10, 2) NOT NULL,
    item_condition VARCHAR(50) NOT NULL DEFAULT 'Good',
    location VARCHAR(150) NOT NULL,
    image_url TEXT DEFAULT NULL,
    is_available TINYINT(1) DEFAULT 1,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
    FOREIGN KEY (owner_id) REFERENCES users(id) ON DELETE CASCADE,
    INDEX idx_prod_category (category),
    INDEX idx_prod_owner (owner_id),
    INDEX idx_prod_available (is_available)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_general_ci;

-- 3. BOOKINGS TABLE
CREATE TABLE IF NOT EXISTS bookings (
    id INT AUTO_INCREMENT PRIMARY KEY,
    product_id INT NOT NULL,
    renter_id INT NOT NULL,
    start_date DATE NOT NULL,
    end_date DATE NOT NULL,
    total_days INT NOT NULL,
    daily_rate DECIMAL(10, 2) NOT NULL,
    rent_amount DECIMAL(10, 2) NOT NULL,
    security_deposit DECIMAL(10, 2) NOT NULL,
    total_amount DECIMAL(10, 2) NOT NULL,
    status ENUM('pending', 'approved', 'rejected', 'active', 'return_pending', 'completed', 'cancelled') NOT NULL DEFAULT 'pending',
    is_negotiated TINYINT(1) DEFAULT 0,
    renter_note TEXT DEFAULT NULL,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
    FOREIGN KEY (product_id) REFERENCES products(id) ON DELETE CASCADE,
    FOREIGN KEY (renter_id) REFERENCES users(id) ON DELETE CASCADE,
    INDEX idx_booking_renter (renter_id),
    INDEX idx_booking_product (product_id),
    INDEX idx_booking_status (status)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_general_ci;

-- 4. NEGOTIATIONS TABLE (Bargaining & Counter-offers)
CREATE TABLE IF NOT EXISTS negotiations (
    id INT AUTO_INCREMENT PRIMARY KEY,
    booking_id INT DEFAULT NULL,
    product_id INT NOT NULL,
    renter_id INT NOT NULL,
    owner_id INT NOT NULL,
    original_daily_rate DECIMAL(10, 2) NOT NULL,
    proposed_daily_rate DECIMAL(10, 2) NOT NULL,
    counter_daily_rate DECIMAL(10, 2) DEFAULT NULL,
    status ENUM('pending', 'accepted', 'countered', 'rejected') NOT NULL DEFAULT 'pending',
    renter_message TEXT DEFAULT NULL,
    owner_message TEXT DEFAULT NULL,
    last_actor_id INT NOT NULL,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
    FOREIGN KEY (booking_id) REFERENCES bookings(id) ON DELETE SET NULL,
    FOREIGN KEY (product_id) REFERENCES products(id) ON DELETE CASCADE,
    FOREIGN KEY (renter_id) REFERENCES users(id) ON DELETE CASCADE,
    FOREIGN KEY (owner_id) REFERENCES users(id) ON DELETE CASCADE,
    INDEX idx_neg_booking (booking_id),
    INDEX idx_neg_renter (renter_id),
    INDEX idx_neg_owner (owner_id)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_general_ci;

-- 5. PAYMENTS TABLE (Simulated Checkout & Escrow)
CREATE TABLE IF NOT EXISTS payments (
    id INT AUTO_INCREMENT PRIMARY KEY,
    booking_id INT NOT NULL UNIQUE,
    user_id INT NOT NULL,
    transaction_id VARCHAR(100) NOT NULL UNIQUE,
    payment_method ENUM('card', 'upi', 'netbanking', 'wallet') NOT NULL,
    rent_amount DECIMAL(10, 2) NOT NULL,
    deposit_amount DECIMAL(10, 2) NOT NULL,
    total_amount DECIMAL(10, 2) NOT NULL,
    status ENUM('completed', 'refunded', 'partially_refunded', 'failed') NOT NULL DEFAULT 'completed',
    escrow_status ENUM('held', 'released_to_owner', 'refunded_to_renter', 'partially_released') NOT NULL DEFAULT 'held',
    card_last4 VARCHAR(4) DEFAULT NULL,
    upi_id VARCHAR(100) DEFAULT NULL,
    paid_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    FOREIGN KEY (booking_id) REFERENCES bookings(id) ON DELETE CASCADE,
    FOREIGN KEY (user_id) REFERENCES users(id) ON DELETE CASCADE,
    INDEX idx_payment_user (user_id)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_general_ci;

-- 6. RETURNS TABLE (Return Request & Inspection Flow)
CREATE TABLE IF NOT EXISTS returns (
    id INT AUTO_INCREMENT PRIMARY KEY,
    booking_id INT NOT NULL UNIQUE,
    return_requested_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    renter_notes TEXT DEFAULT NULL,
    inspected_at TIMESTAMP NULL DEFAULT NULL,
    item_condition ENUM('excellent', 'good', 'minor_wear', 'damaged') DEFAULT 'good',
    damage_fee DECIMAL(10, 2) DEFAULT 0.00,
    refunded_deposit DECIMAL(10, 2) DEFAULT 0.00,
    owner_remarks TEXT DEFAULT NULL,
    status ENUM('pending_inspection', 'completed', 'disputed') NOT NULL DEFAULT 'pending_inspection',
    FOREIGN KEY (booking_id) REFERENCES bookings(id) ON DELETE CASCADE,
    INDEX idx_return_booking (booking_id)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_general_ci;

-- 7. REVIEWS TABLE
CREATE TABLE IF NOT EXISTS reviews (
    id INT AUTO_INCREMENT PRIMARY KEY,
    booking_id INT NOT NULL,
    product_id INT NOT NULL,
    reviewer_id INT NOT NULL,
    target_user_id INT NOT NULL,
    rating INT NOT NULL CHECK (rating >= 1 AND rating <= 5),
    comment TEXT NOT NULL,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    FOREIGN KEY (booking_id) REFERENCES bookings(id) ON DELETE CASCADE,
    FOREIGN KEY (product_id) REFERENCES products(id) ON DELETE CASCADE,
    FOREIGN KEY (reviewer_id) REFERENCES users(id) ON DELETE CASCADE,
    FOREIGN KEY (target_user_id) REFERENCES users(id) ON DELETE CASCADE,
    INDEX idx_rev_product (product_id),
    INDEX idx_rev_target_user (target_user_id)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_general_ci;

-- 8. NOTIFICATIONS TABLE (Activity Center & Updates)
CREATE TABLE IF NOT EXISTS notifications (
    id INT AUTO_INCREMENT PRIMARY KEY,
    user_id INT NOT NULL,
    title VARCHAR(150) NOT NULL,
    message TEXT NOT NULL,
    type VARCHAR(50) DEFAULT 'general',
    link VARCHAR(255) DEFAULT NULL,
    is_read TINYINT(1) DEFAULT 0,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    FOREIGN KEY (user_id) REFERENCES users(id) ON DELETE CASCADE,
    INDEX idx_notif_user (user_id, is_read)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_general_ci;
