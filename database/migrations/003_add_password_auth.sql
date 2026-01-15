-- =====================================================
-- MIGRATION 003: Add Password Authentication
-- =====================================================
-- Adds password_hash column to users table for secure authentication
-- For production deployment
-- =====================================================

-- Add password_hash column
ALTER TABLE users 
ADD COLUMN IF NOT EXISTS password_hash VARCHAR(255);

-- Add index for faster email lookups during login
CREATE INDEX IF NOT EXISTS idx_users_email ON users(email);

-- Sample users with bcrypt hashed password "password123"
-- Hash generated with: bcrypt.hash('password123', 10)
-- In production, use proper password hashing!

-- Update existing users with hashed password (for demo/development only)
-- Password: password123
UPDATE users 
SET password_hash = '$2a$10$N9qo8uLOickgx2ZMRZoMye.IKV4S9GvzLvYqTUQmRPdE3YQONXZdK'
WHERE password_hash IS NULL;

-- Comment to document
COMMENT ON COLUMN users.password_hash IS 'Bcrypt hashed password. Never store plain text passwords!';

-- =====================================================
-- IMPORTANT PRODUCTION NOTES:
-- =====================================================
-- 1. Generate real password hashes using bcrypt in your application
-- 2. Enforce strong password policies (min length, complexity)
-- 3. Implement password reset functionality
-- 4. Add rate limiting for login attempts
-- 5. Log all authentication attempts
-- 6. Consider adding 2FA for admin accounts
-- =====================================================
