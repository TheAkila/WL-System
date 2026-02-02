-- =====================================================
-- QUICK SETUP: Create users table and seed default users
-- =====================================================
-- Run this in Supabase SQL Editor
-- =====================================================

-- Create user_role enum if it doesn't exist
DO $$ BEGIN
    CREATE TYPE user_role AS ENUM ('admin', 'technical', 'referee', 'viewer');
EXCEPTION
    WHEN duplicate_object THEN null;
END $$;

-- Create users table
CREATE TABLE IF NOT EXISTS users (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    email VARCHAR(255) UNIQUE NOT NULL,
    name VARCHAR(255) NOT NULL,
    role user_role DEFAULT 'viewer',
    password_hash VARCHAR(255),
    is_active BOOLEAN DEFAULT true,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP
);

-- Add index for email lookups
CREATE INDEX IF NOT EXISTS idx_users_email ON users(email);

-- Insert default users with bcrypt hashed "password123"
-- Hash: $2a$10$N9qo8uLOickgx2ZMRZoMye.IKV4S9GvzLvYqTUQmRPdE3YQONXZdK
INSERT INTO users (email, name, role, password_hash, is_active) 
VALUES 
    ('admin@test.com', 'Admin User', 'admin', '$2a$10$N9qo8uLOickgx2ZMRZoMye.IKV4S9GvzLvYqTUQmRPdE3YQONXZdK', true),
    ('tech@test.com', 'Technical Official', 'technical', '$2a$10$N9qo8uLOickgx2ZMRZoMye.IKV4S9GvzLvYqTUQmRPdE3YQONXZdK', true),
    ('ref@test.com', 'Referee', 'referee', '$2a$10$N9qo8uLOickgx2ZMRZoMye.IKV4S9GvzLvYqTUQmRPdE3YQONXZdK', true)
ON CONFLICT (email) 
DO UPDATE SET 
    password_hash = EXCLUDED.password_hash,
    is_active = EXCLUDED.is_active;

-- Verify users were created
SELECT id, email, name, role, is_active FROM users;
