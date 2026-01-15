# JWT Authentication System

## Overview

The Lifting Live Arena system uses **JWT (JSON Web Token)** authentication to secure the Technical Panel and administrative endpoints. Only authorized officials with valid credentials can access and modify competition data.

## Authentication Flow

```
┌─────────────┐      1. Login Request       ┌──────────┐
│   Client    │ ────────────────────────────>│  Backend │
│ (Admin Panel)│  email + password           │   API    │
└─────────────┘                              └──────────┘
                                                   │
                                             2. Verify credentials
                                                   │ (Check DB)
                                                   ▼
                                             ┌──────────┐
                                             │ Supabase │
                                             │ Database │
                                             └──────────┘
                                                   │
                                             3. Generate JWT
                                                   │
┌─────────────┐      4. Return token        ┌──────────┐
│   Client    │ <────────────────────────────│  Backend │
│             │  { user, token }            │          │
└─────────────┘                              └──────────┘
       │
       │ 5. Store token in localStorage
       │
       ▼
┌─────────────┐      6. API Requests        ┌──────────┐
│   Client    │ ────────────────────────────>│  Backend │
│             │  Authorization: Bearer <token>│        │
└─────────────┘                              └──────────┘
```

## Setup & Configuration

### 1. Environment Variables

**Backend** (`apps/backend/.env`):
```env
JWT_SECRET=your_random_32_char_secret_here
JWT_EXPIRE=7d
```

Generate a secure JWT secret:
```bash
node -e "console.log(require('crypto').randomBytes(32).toString('hex'))"
```

### 2. Database Setup

#### Development (Quick Start)
Users are pre-configured with a default password: `password123`

Test credentials:
```
admin@test.com / password123
tech@test.com / password123
```

#### Production (Recommended)
Run migration to add password hashing:

```sql
-- In Supabase SQL Editor
-- Run: database/migrations/003_add_password_auth.sql
```

This adds `password_hash` column for secure bcrypt password storage.

## API Endpoints

### Login
```http
POST /api/auth/login
Content-Type: application/json

{
  "email": "admin@test.com",
  "password": "password123"
}
```

**Response:**
```json
{
  "success": true,
  "data": {
    "user": {
      "id": "uuid",
      "name": "Admin User",
      "email": "admin@test.com",
      "role": "admin"
    },
    "token": "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9..."
  }
}
```

### Get Current User
```http
GET /api/auth/me
Authorization: Bearer <token>
```

**Response:**
```json
{
  "success": true,
  "data": {
    "id": "uuid",
    "name": "Admin User",
    "email": "admin@test.com",
    "role": "admin",
    "is_active": true
  }
}
```

### Logout
```http
POST /api/auth/logout
Authorization: Bearer <token>
```

**Response:**
```json
{
  "success": true,
  "data": {}
}
```

## Protected Routes

All technical panel routes require authentication:

```javascript
// Example: Declare attempt
POST /api/technical/attempts/declare
Authorization: Bearer <token>
```

### Role-Based Access Control

| Role | Access Level |
|------|-------------|
| `admin` | Full access to all endpoints |
| `technical` | Technical panel operations (declare attempts, record decisions) |
| `referee` | Record referee decisions only |
| `viewer` | Read-only access (leaderboards, sessions) |

## Frontend Integration

### 1. Login Page

The admin panel includes a login page at `/login`:

```jsx
// Navigate to http://localhost:3000/login
```

**Features:**
- Email/password input
- Loading states
- Error handling
- Demo credentials display
- Auto-redirect after login

### 2. Authentication Context

The `AuthContext` provides authentication state across the app:

```jsx
import { useAuth } from '../contexts/AuthContext';

function MyComponent() {
  const { user, login, logout, isAuthenticated, hasRole } = useAuth();
  
  // Check if user is logged in
  if (!isAuthenticated) {
    return <div>Please log in</div>;
  }
  
  // Check user role
  if (hasRole('admin', 'technical')) {
    return <div>Welcome, {user.name}!</div>;
  }
}
```

### 3. Protected Routes

Routes are automatically protected using `ProtectedRoute` component:

```jsx
<Route
  path="/technical"
  element={
    <ProtectedRoute roles={['admin', 'technical']}>
      <TechnicalPanel />
    </ProtectedRoute>
  }
/>
```

### 4. Token Storage

Tokens are stored in localStorage:

```javascript
// Automatically handled by AuthService
localStorage.getItem('token')
localStorage.getItem('user')
```

### 5. Auto Token Injection

All API requests automatically include the token:

```javascript
// api.js interceptor adds token to all requests
config.headers.Authorization = `Bearer ${token}`;
```

### 6. Token Expiration Handling

Expired tokens automatically redirect to login:

```javascript
// api.js response interceptor
if (error.response?.status === 401) {
  localStorage.removeItem('token');
  window.location.href = '/login';
}
```

## Security Features

### ✅ Implemented

1. **JWT Token Authentication**
   - Secure token generation with expiration
   - Token verification on every request
   - Automatic token refresh on page reload

2. **Password Security** (Production)
   - Bcrypt password hashing
   - Never stores plain text passwords
   - Salted hashes for extra security

3. **Role-Based Access Control (RBAC)**
   - Fine-grained permissions per role
   - Middleware enforces role requirements
   - Frontend hides unauthorized UI elements

4. **Token Storage**
   - localStorage for client-side persistence
   - Automatic token cleanup on logout
   - Cleared on 401 responses

5. **HTTPS Ready**
   - Secure token transmission
   - Prepared for production SSL

### 🔒 Best Practices

1. **Always use HTTPS in production**
2. **Set short token expiration** (7 days default)
3. **Implement token refresh** for long sessions
4. **Add rate limiting** on login endpoint
5. **Log authentication events** for auditing
6. **Implement 2FA** for admin accounts (future)

## User Management

### Create New User (SQL)

```sql
INSERT INTO users (email, name, role, password_hash, is_active) VALUES
('official@example.com', 'Official Name', 'technical', 
 '$2a$10$N9qo8uLOickgx2ZMRZoMye.IKV4S9GvzLvYqTUQmRPdE3YQONXZdK', -- password123
 true);
```

### Generate Password Hash (Node.js)

```javascript
const bcrypt = require('bcryptjs');
const password = 'mySecurePassword123';
const hash = await bcrypt.hash(password, 10);
console.log(hash); // Use this in SQL INSERT
```

### Deactivate User

```sql
UPDATE users 
SET is_active = false 
WHERE email = 'user@example.com';
```

### Change User Role

```sql
UPDATE users 
SET role = 'admin' 
WHERE email = 'user@example.com';
```

## Testing

### Manual Testing

1. **Test Login Flow**
   ```bash
   # Start backend
   cd apps/backend && npm run dev
   
   # Start admin panel
   cd apps/admin-panel && npm run dev
   
   # Navigate to http://localhost:3000/login
   # Login with: admin@test.com / password123
   ```

2. **Test Protected Routes**
   - Try accessing `/technical` without logging in → Should redirect to `/login`
   - Login and access `/technical` → Should work
   - Logout → Should redirect to `/login`

3. **Test Token Expiration**
   - Login and get token
   - Manually set expired token in localStorage
   - Make API request → Should redirect to login

### API Testing (curl)

```bash
# Login
curl -X POST http://localhost:5000/api/auth/login \
  -H "Content-Type: application/json" \
  -d '{"email":"admin@test.com","password":"password123"}'

# Save the token from response

# Get current user
curl http://localhost:5000/api/auth/me \
  -H "Authorization: Bearer YOUR_TOKEN_HERE"

# Declare attempt (protected route)
curl -X POST http://localhost:5000/api/technical/attempts/declare \
  -H "Authorization: Bearer YOUR_TOKEN_HERE" \
  -H "Content-Type: application/json" \
  -d '{"athleteId":"athlete-uuid","weight":150}'
```

## Troubleshooting

### "Invalid credentials" error

**Check:**
- Email exists in database
- Password is correct (`password123` for demo users)
- User `is_active = true`
- Database connection working

**Verify user exists:**
```sql
SELECT * FROM users WHERE email = 'admin@test.com';
```

### "Not authorized to access this route" (401)

**Check:**
- Token is being sent in Authorization header
- Token is not expired
- JWT_SECRET matches between token generation and verification
- Token format: `Bearer <token>`

**Debug token:**
```javascript
// In browser console
localStorage.getItem('token')
```

### "User role not authorized" (403)

**Check:**
- User has correct role in database
- Route requires correct role
- Role names match exactly (case-sensitive)

**Verify user role:**
```sql
SELECT email, role FROM users WHERE email = 'user@example.com';
```

### Token keeps getting cleared

**Check:**
- Backend is running (tokens validated against backend)
- JWT_SECRET hasn't changed
- Token hasn't expired
- No CORS issues in browser console

### Auto-redirect loop

**Check:**
- ProtectedRoute is not wrapping login page
- Login page path is `/login` (not protected)
- Auth state is being checked correctly

## Production Deployment

### 1. Generate Secure JWT Secret

```bash
# Generate strong 32-byte secret
node -e "console.log(require('crypto').randomBytes(32).toString('hex'))"
```

### 2. Set Environment Variables

```env
# Production backend .env
JWT_SECRET=<64-char-hex-string-from-above>
JWT_EXPIRE=7d
NODE_ENV=production
```

### 3. Run Password Migration

```sql
-- In production Supabase SQL Editor
-- Run: database/migrations/003_add_password_auth.sql
```

### 4. Create Real Users

```javascript
// Use bcrypt to hash passwords
const bcrypt = require('bcryptjs');
const hash = await bcrypt.hash('RealPassword123!', 10);

// Then insert with hashed password
INSERT INTO users (email, name, role, password_hash) VALUES
('admin@production.com', 'Admin User', 'admin', '<hashed-password>');
```

### 5. Security Checklist

- [ ] Change all default passwords
- [ ] Use strong JWT secret (32+ chars)
- [ ] Enable HTTPS/SSL
- [ ] Set secure CORS origins
- [ ] Enable rate limiting on login
- [ ] Add logging for auth events
- [ ] Remove demo credentials from login page
- [ ] Set appropriate token expiration
- [ ] Implement password reset flow
- [ ] Consider adding 2FA

## Future Enhancements

- [ ] Refresh token mechanism
- [ ] Password reset via email
- [ ] Two-factor authentication (2FA)
- [ ] Session management (logout all devices)
- [ ] Login attempt rate limiting
- [ ] Account lockout after failed attempts
- [ ] Password strength requirements
- [ ] Password expiration policy
- [ ] Audit log for authentication events
- [ ] OAuth integration (Google, Microsoft)

## Related Documentation

- [Technical Panel Guide](TECHNICAL_PANEL.md)
- [Supabase Setup](SUPABASE_SETUP.md)
- [Backend API Documentation](apps/backend/README.md)
