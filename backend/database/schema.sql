-- backend/database/schema.sql
-- AdventureConnect Database Schema for Phase 1

-- Create database
CREATE DATABASE IF NOT EXISTS adventureconnect;
USE adventureconnect;

-- Users table
CREATE TABLE users (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    email VARCHAR(255) UNIQUE NOT NULL,
    password VARCHAR(255) NOT NULL,
    first_name VARCHAR(100) NOT NULL,
    last_name VARCHAR(100) NOT NULL,
    user_type ENUM('traveler', 'provider') NOT NULL,
    phone VARCHAR(20),
    avatar VARCHAR(500),
    email_verified BOOLEAN DEFAULT FALSE,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
    INDEX idx_email (email),
    INDEX idx_user_type (user_type)
);

-- Providers table (extends users with provider-specific data)
CREATE TABLE providers (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    user_id UUID NOT NULL,
    name VARCHAR(255) NOT NULL,
    business_name VARCHAR(255),
    bio TEXT,
    expertise_areas JSON,
    experience_years INTEGER DEFAULT 0,
    total_trips INTEGER DEFAULT 0,
    verified BOOLEAN DEFAULT FALSE,
    verification_date TIMESTAMP,
    payout_info JSON,
    commission_rate DECIMAL(5,2) DEFAULT 15.00,
    status ENUM('active', 'inactive', 'suspended') DEFAULT 'active',
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
    FOREIGN KEY (user_id) REFERENCES users(id) ON DELETE CASCADE,
    INDEX idx_user_id (user_id)
);

-- Trips table
CREATE TABLE trips (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    provider_id UUID NOT NULL,
    trip_type ENUM('service_component', 'example_itinerary') NOT NULL,
    title VARCHAR(255) NOT NULL,
    description TEXT NOT NULL,
    location VARCHAR(255) NOT NULL,
    activity_type VARCHAR(100) NOT NULL,
    duration VARCHAR(100) NOT NULL,
    max_group_size INTEGER NOT NULL,
    base_price DECIMAL(10,2) NOT NULL,
    included TEXT,
    excluded TEXT,
    images JSON,
    customizable_components JSON,
    availability VARCHAR(50) DEFAULT 'daily',
    status ENUM('pending', 'active', 'inactive') DEFAULT 'pending',
    rating DECIMAL(2,1) DEFAULT 0.0,
    review_count INTEGER DEFAULT 0,
    booking_count INTEGER DEFAULT 0,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
    FOREIGN KEY (provider_id) REFERENCES providers(id) ON DELETE CASCADE,
    INDEX idx_provider_id (provider_id),
    INDEX idx_status (status),
    INDEX idx_location (location),
    INDEX idx_activity_type (activity_type),
    INDEX idx_price (base_price)
);

-- Bookings table
CREATE TABLE bookings (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    trip_id UUID NOT NULL,
    user_id UUID NOT NULL,
    booking_number VARCHAR(20) UNIQUE NOT NULL,
    customization JSON NOT NULL,
    traveler_info JSON NOT NULL,
    special_requests TEXT,
    total_price DECIMAL(10,2) NOT NULL,
    commission_amount DECIMAL(10,2) NOT NULL,
    payment_method VARCHAR(50),
    payment_status ENUM('pending', 'completed', 'failed', 'refunded') DEFAULT 'pending',
    payment_id VARCHAR(255),
    booking_status ENUM('pending', 'confirmed', 'cancelled', 'completed') DEFAULT 'pending',
    cancelled_at TIMESTAMP,
    cancellation_reason TEXT,
    completed_at TIMESTAMP,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
    FOREIGN KEY (trip_id) REFERENCES trips(id),
    FOREIGN KEY (user_id) REFERENCES users(id),
    INDEX idx_trip_id (trip_id),
    INDEX idx_user_id (user_id),
    INDEX idx_booking_number (booking_number),
    INDEX idx_booking_status (booking_status),
    INDEX idx_created_at (created_at)
);

-- Reviews table (for future use)
CREATE TABLE reviews (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    trip_id UUID NOT NULL,
    booking_id UUID NOT NULL,
    user_id UUID NOT NULL,
    rating INTEGER NOT NULL CHECK (rating >= 1 AND rating <= 5),
    title VARCHAR(255),
    comment TEXT,
    photos JSON,
    provider_response TEXT,
    provider_response_at TIMESTAMP,
    helpful_count INTEGER DEFAULT 0,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
    FOREIGN KEY (trip_id) REFERENCES trips(id),
    FOREIGN KEY (booking_id) REFERENCES bookings(id),
    FOREIGN KEY (user_id) REFERENCES users(id),
    UNIQUE KEY unique_booking_review (booking_id),
    INDEX idx_trip_id (trip_id),
    INDEX idx_user_id (user_id),
    INDEX idx_rating (rating)
);

-- Messages table (for future use)
CREATE TABLE messages (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    sender_id UUID NOT NULL,
    receiver_id UUID NOT NULL,
    trip_id UUID,
    booking_id UUID,
    message TEXT NOT NULL,
    read_at TIMESTAMP,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    FOREIGN KEY (sender_id) REFERENCES users(id),
    FOREIGN KEY (receiver_id) REFERENCES users(id),
    FOREIGN KEY (trip_id) REFERENCES trips(id),
    FOREIGN KEY (booking_id) REFERENCES bookings(id),
    INDEX idx_sender_receiver (sender_id, receiver_id),
    INDEX idx_created_at (created_at)
);

-- Wishlists table
CREATE TABLE wishlists (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    user_id UUID NOT NULL,
    trip_id UUID NOT NULL,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    FOREIGN KEY (user_id) REFERENCES users(id) ON DELETE CASCADE,
    FOREIGN KEY (trip_id) REFERENCES trips(id) ON DELETE CASCADE,
    UNIQUE KEY unique_user_trip (user_id, trip_id),
    INDEX idx_user_id (user_id)
);

-- Create function to update updated_at timestamp
DELIMITER $$
CREATE TRIGGER update_users_updated_at BEFORE UPDATE ON users
FOR EACH ROW
BEGIN
    SET NEW.updated_at = CURRENT_TIMESTAMP;
END$$

CREATE TRIGGER update_providers_updated_at BEFORE UPDATE ON providers
FOR EACH ROW
BEGIN
    SET NEW.updated_at = CURRENT_TIMESTAMP;
END$$

CREATE TRIGGER update_trips_updated_at BEFORE UPDATE ON trips
FOR EACH ROW
BEGIN
    SET NEW.updated_at = CURRENT_TIMESTAMP;
END$$

CREATE TRIGGER update_bookings_updated_at BEFORE UPDATE ON bookings
FOR EACH ROW
BEGIN
    SET NEW.updated_at = CURRENT_TIMESTAMP;
END$$
DELIMITER ;

-- Sample data for testing
-- Insert test users
INSERT INTO users (email, password, first_name, last_name, user_type) VALUES
('traveler@test.com', '$2a$10$YourHashedPasswordHere', 'John', 'Traveler', 'traveler'),
('provider@test.com', '$2a$10$YourHashedPasswordHere', 'Jane', 'Provider', 'provider');

-- Insert test provider profile
INSERT INTO providers (user_id, name, bio, experience_years) 
SELECT id, CONCAT(first_name, ' ', last_name), 'Experienced travel guide specializing in local Bangkok experiences', 5
FROM users WHERE email = 'provider@test.com';

-- Insert test trip
INSERT INTO trips (
    provider_id, 
    trip_type, 
    title, 
    description, 
    location, 
    activity_type, 
    duration, 
    max_group_size, 
    base_price,
    customizable_components,
    status
) 
SELECT 
    p.id,
    'service_component',
    'Bangkok Street Food Tour',
    'Discover the best local street food spots in Bangkok with a passionate foodie guide',
    'Bangkok, Thailand',
    'Culinary',
    '4 hours',
    8,
    45.00,
    '{"accommodation": true, "activities": true}',
    'active'
FROM providers p
JOIN users u ON p.user_id = u.id
WHERE u.email = 'provider@test.com';