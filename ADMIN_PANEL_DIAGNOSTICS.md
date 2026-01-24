# Admin Panel Diagnostics & Troubleshooting Guide

## Last Updated: January 15, 2026

### ✅ Build Status
- **Build Result**: PASSING (No errors or warnings)
- **Build Time**: 2.28s
- **Bundle Size**: 112.58 KB gzipped
- **Modules**: 1538 successfully transformed

### ✅ Server Status
- **Frontend Dev Server**: Running on http://localhost:3005
- **Backend API Server**: Running on http://localhost:5000
- **Socket Service**: Configured for http://localhost:5000

---

## Feature Checklist

### 🔐 Authentication
- [x] Login page (LoginPage.jsx) - Redesigned with modern Hub-style UI
- [x] Dark/Light mode toggle - Functional with localStorage persistence
- [x] Token persistence - AuthService handles localStorage
- [x] Protected routes - ProtectedRoute component validates auth
- [x] Error handling - Improved error messages from API

**If NOT working**: 
1. Check browser console for CORS errors
2. Verify backend is running: `curl http://localhost:5000/api/health`
3. Check `.env` file has correct `VITE_API_URL=http://localhost:5000/api`
4. Clear browser localStorage: Press F12 → Application → Clear All
5. Hard refresh: Cmd+Shift+R (Mac) or Ctrl+Shift+R (Windows)

---

### 📊 Dashboard
- [x] Statistics loading (Competitions, Athletes, Sessions count)
- [x] Quick Actions buttons
- [x] System Status display
- **API Endpoints Used**:
  - `GET /api/competitions` 
  - `GET /api/athletes`
  - `GET /api/sessions`

**If NOT working**:
- Check Network tab in browser DevTools (F12)
- Look for 404 errors - verify backend endpoints exist
- Check if stats show as "0" - API might be returning empty arrays
- Verify JSON response format: `{ success: true, count: N, data: [...] }`

---

### 🏆 Competitions Page
- [x] List competitions from API
- [x] Search/filter functionality
- [x] Create competition form
- [x] Edit competition
- [x] Delete competition
- **API Endpoints Used**:
  - `GET /api/competitions`
  - `POST /api/competitions`
  - `PUT /api/competitions/:id`
  - `DELETE /api/competitions/:id`

**If NOT working**:
- Check if list loads but filtering fails - JavaScript issue
- Check if form doesn't submit - validation or API error
- Check Network tab for API call details
- Ensure user role is 'admin' or 'technical'

---

### 👥 Athletes Page
- [x] List athletes from API
- [x] Search/filter by name and gender
- [x] Register new athlete form
- [x] Edit athlete
- [x] Delete athlete
- **API Endpoints Used**:
  - `GET /api/athletes`
  - `GET /api/sessions` (for dropdown)
  - `POST /api/athletes`
  - `PUT /api/athletes/:id`
  - `DELETE /api/athletes/:id`

**If NOT working**:
- Check if form fields match backend schema
- Verify all required fields are filled
- Check Network tab for validation errors
- Sessions dropdown might be empty if no sessions exist

---

### 📅 Sessions Page
- [x] List sessions from API
- [x] Search/filter by name and status
- [x] Create session form
- [x] Edit session
- [x] Delete session
- **API Endpoints Used**:
  - `GET /api/sessions`
  - `GET /api/competitions` (for dropdown)
  - `POST /api/sessions`
  - `PUT /api/sessions/:id`
  - `DELETE /api/sessions/:id`

**If NOT working**:
- Check if competitions dropdown is empty - create competitions first
- Verify session form field names match backend schema
- Check if status filter works but list doesn't load

---

### ⚡ Technical Panel
- [x] Session selector dropdown
- [x] Lifting order display
- [x] Current attempt tracking
- [x] Medal assignment
- [x] Real-time socket updates
- **API Endpoints Used**:
  - `GET /api/technical/sessions/:sessionId/lifting-order`
  - `GET /api/technical/sessions/:sessionId/current-attempt`
  - `GET /api/technical/sessions/:sessionId/leaderboard`
  - `PUT /api/technical/athletes/:athleteId/medal`
- **Socket Events**: attempt:created, attempt:validated, session:updated, leaderboard:updated

**If NOT working**:
- No session selector options → No active sessions exist
- Lifting order empty → Add athletes to session first
- Real-time updates not working → Socket connection issue
- Medal button clicks not saving → Permission issue

---

## Common Issues & Solutions

### Issue: "Failed to load [page]" error
**Solution**:
1. Open browser DevTools (F12)
2. Go to Network tab
3. Reload page
4. Look for failed API calls (red entries)
5. Check the API response for error message
6. Verify backend has the required data

### Issue: Dark mode not saving
**Solution**:
1. Open DevTools → Application
2. Check localStorage has `darkMode: true/false`
3. Clear localStorage if corrupted
4. Hard refresh (Cmd+Shift+R)

### Issue: Login page shows but won't submit
**Solution**:
1. Check Network tab for POST /api/auth/login call
2. Verify email/password credentials (admin@test.com / password123)
3. Check browser console for JavaScript errors
4. Verify VITE_API_URL env var points to correct backend

### Issue: Navigation works but pages are blank
**Solution**:
1. Check if API calls are pending (Network tab)
2. Look for errors in browser console
3. Verify user has required role (admin/technical)
4. Check if data is loading but not rendering (use React DevTools)

### Issue: Create/Edit/Delete buttons don't work
**Solution**:
1. Check if form validation errors appear
2. Look at Network tab for API call details
3. Check backend logs for error messages
4. Verify user has required permissions (role-based)

---

## Quick Diagnostic Checklist

Run these tests in your browser console (F12):

```javascript
// Test 1: Check API connection
fetch('http://localhost:5000/api/health')
  .then(r => r.json())
  .then(d => console.log('API:', d))
  .catch(e => console.error('API Error:', e));

// Test 2: Check auth token
console.log('Token:', localStorage.getItem('token'));
console.log('User:', localStorage.getItem('user'));

// Test 3: Check dark mode
console.log('Dark Mode:', localStorage.getItem('darkMode'));

// Test 4: Check auth context
console.log('Document HTML class:', document.documentElement.className);
```

---

## Recent Changes Made

1. **Updated Login.jsx** (Jan 15, 2026)
   - Switched from `useAuthStore` to `authService` for consistency
   - Added modern Hub-style design with dark mode toggle
   - Improved responsive design for mobile screens
   - Enhanced error handling with better messages

2. **Fixed Dashboard.jsx** (Jan 15, 2026)
   - Improved stats fetching to handle different API response formats
   - Added fallback values on API errors
   - Better null/undefined checking

3. **Tailwind Config** (Previous sessions)
   - Explicit color palettes: slate, zinc, red, green, yellow, blue, purple
   - Custom shadows and border radius
   - Dark mode support with class-based strategy

---

## Files Ready for Testing

- ✅ `/apps/admin-panel/src/pages/Dashboard.jsx` - Stats loading fixed
- ✅ `/apps/admin-panel/src/pages/Login.jsx` - Design updated
- ✅ `/apps/admin-panel/src/pages/LoginPage.jsx` - Using AuthContext (app uses this)
- ✅ `/apps/admin-panel/src/pages/Competitions.jsx` - CRUD operations
- ✅ `/apps/admin-panel/src/pages/Athletes.jsx` - CRUD operations
- ✅ `/apps/admin-panel/src/pages/Sessions.jsx` - CRUD operations
- ✅ `/apps/admin-panel/src/pages/TechnicalPanel.jsx` - Socket events + API calls
- ✅ `/apps/admin-panel/src/components/Layout.jsx` - Navigation + dark mode

---

## How to Test Features

### 1. Test Login Flow
1. Navigate to http://localhost:3005/login
2. Enter credentials: admin@test.com / password123
3. Click "Sign In"
4. Should redirect to Dashboard

### 2. Test Dashboard
1. After login, verify stats load (look for numbers, not 0)
2. Test "New Competition" button
3. Test dark/light mode toggle

### 3. Test Competitions Page
1. Click "Competitions" in navigation
2. List should show any existing competitions
3. Click "New Competition" button
4. Fill form and submit
5. New competition should appear in list

### 4. Test Athletes Page
1. Click "Athletes" in navigation
2. Register a new athlete
3. Verify it appears in list
4. Test search filter by name

### 5. Test Sessions Page
1. Click "Sessions" in navigation
2. Create new session (requires competition)
3. Add athletes to session
4. Test status filter

### 6. Test Technical Panel
1. Click "Technical Panel" in navigation
2. Select a session from dropdown
3. Should show lifting order and leaderboard
4. Medal assignment buttons should be clickable

---

## Need More Help?

Please provide:
1. **Specific feature that's not working** (e.g., "Athletes list won't load")
2. **Error message** from browser console or toast notification
3. **Network tab details** showing failed API call
4. **Backend logs** if available

Then I can provide targeted fixes!
