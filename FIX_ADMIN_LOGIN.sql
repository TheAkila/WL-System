-- =====================================================
-- ADMIN PANEL LOGIN FIX
-- =====================================================
-- Instructions:
-- 1. Go to https://supabase.com/dashboard
-- 2. Select your project: axhbgtkdvghjxtrcvbkc
-- 3. Click "SQL Editor" in the left menu
-- 4. Click "New Query"
-- 5. Copy and paste this entire file
-- 6. Click "Run" or press Cmd/Ctrl + Enter
-- =====================================================

-- Step 1: Create user_role enum type
DO $$ BEGIN
    CREATE TYPE user_role AS ENUM ('admin', 'technical', 'referee', 'viewer');
EXCEPTION
    WHEN duplicate_object THEN 
        RAISE NOTICE 'user_role type already exists, skipping.';
END $$;

-- Step 2: Create users table
CREATE TABLE IF NOT EXISTS wl_users (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    email VARCHAR(255) UNIQUE NOT NULL,
    name VARCHAR(255) NOT NULL,
    role user_role DEFAULT 'viewer',
    password VARCHAR(255),
    is_active BOOLEAN DEFAULT true,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP
);

-- Step 3: Add email index for faster lookups
CREATE INDEX IF NOT EXISTS idx_wl_users_email ON wl_users(email);

-- Step 4: Insert or update default admin users
-- Password for all users: password123
-- Hashed with bcrypt: $2a$10$N9qo8uLOickgx2ZMRZoMye.IKV4S9GvzLvYqTUQmRPdE3YQONXZdK
INSERT INTO wl_users (email, name, role, password, is_active) 
VALUES 
    ('admin@test.com', 'Admin User', 'admin', '$2a$10$N9qo8uLOickgx2ZMRZoMye.IKV4S9GvzLvYqTUQmRPdE3YQONXZdK', true),
    ('tech@test.com', 'Technical Official', 'technical', '$2a$10$N9qo8uLOickgx2ZMRZoMye.IKV4S9GvzLvYqTUQmRPdE3YQONXZdK', true),
    ('ref@test.com', 'Referee', 'referee', '$2a$10$N9qo8uLOickgx2ZMRZoMye.IKV4S9GvzLvYqTUQmRPdE3YQONXZdK', true)
ON CONFLICT (email) 
DO UPDATE SET 
    password = EXCLUDED.password,
    role = EXCLUDED.role,
    is_active = EXCLUDED.is_active,
    updated_at = CURRENT_TIMESTAMP;

-- Step 5: Verify users were created
SELECT 
    id, 
    email, 
    name, 
    role, 
    is_active,
    CASE 
        WHEN password IS NOT NULL THEN '✓ Has password'
        ELSE '✗ No password'
    END as password_status
FROM wl_users
ORDER BY role, email;

-- =====================================================
-- EXPECTED OUTPUT:
-- =====================================================
-- You should see 3 users:
-- 1. admin@test.com (Admin User) - role: admin
-- 2. tech@test.com (Technical Official) - role: technical  
-- 3. ref@test.com (Referee) - role: referee
--
-- All should show "✓ Has password" and is_active: true
-- =====================================================

-- =====================================================
-- LOGIN CREDENTIALS:
-- =====================================================
-- Email: admin@test.com
-- Password: password123
--
-- Email: tech@test.com
-- Password: password123
--
-- Email: ref@test.com
-- Password: password123
-- =====================================================
