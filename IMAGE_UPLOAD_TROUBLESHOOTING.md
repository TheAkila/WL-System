# Image Upload Troubleshooting Guide

## Prerequisites Checklist

Before troubleshooting, ensure:

- [ ] Backend is running: `cd apps/backend && npm start`
- [ ] Backend is at `http://localhost:5000` (or check VITE_API_URL)
- [ ] You are logged in to the admin panel
- [ ] You have admin permissions
- [ ] Internet connection is stable

---

## Step 1: Check Browser Console

1. Open browser DevTools (F12 or Right-click → Inspect)
2. Go to **Console** tab
3. Try uploading an image
4. Look for error messages starting with:
   - `📤 Uploading` (should see upload starting)
   - `✅ Upload successful` (or `❌ Upload error`)
5. Copy the full error message

---

## Step 2: Check Network Tab

1. Open DevTools → **Network** tab
2. Try uploading an image
3. Look for request to `/api/uploads/competitions/XXX/logo`
4. Check the response:
   - **Status code 200** = Success (check response data)
   - **Status code 401** = Auth expired, login again
   - **Status code 404** = Competition not found
   - **Status code 413** = File too large
   - **Status code 408/504** = Timeout
   - **Status code 500** = Server error (check backend logs)

---

## Step 3: Check Backend Logs

1. Look at terminal where backend is running
2. Search for error messages with:
   - `📸 Uploading athlete photo`
   - `🏆 Uploading competition logo`
   - `❌ Upload error`
   - `💥 Storage upload error`

### Common Backend Errors:

**"Athlete not found"** → Athlete ID is invalid or athlete doesn't exist
**"Competition not found"** → Competition ID is invalid  
**"No file uploaded"** → File wasn't sent (multer issue)
**"Invalid file type"** → File is not JPEG/PNG/WebP
**"File too large"** → File exceeds 5MB limit
**"Upload failed: bucket_not_found"** → Storage buckets not created
**"Authentication failed"** → Token is invalid or expired

---

## Step 4: Verify Storage Buckets

Run this in backend (Node.js REPL):

```javascript
import { supabase } from './src/config/supabase.js';

const { data: buckets, error } = await supabase.storage.listBuckets();
console.log('Buckets:', buckets);
console.log('Error:', error);
```

Expected buckets: `athletes`, `competitions`, `teams`

If missing, buckets will auto-create on next backend restart.

---

## Step 5: Test Upload Endpoint with curl

```bash
# Get your token first (login and check localStorage.getItem('token'))
TOKEN="your_jwt_token_here"
COMPETITION_ID="your_competition_id_here"

# Test competition logo upload
curl -X POST http://localhost:5000/api/uploads/competitions/$COMPETITION_ID/logo \
  -H "Authorization: Bearer $TOKEN" \
  -F "logo=@/path/to/image.jpg"
```

---

## Common Solutions

### Solution 1: Login Again
- Session may have expired during upload
- Go to login page and sign in again
- Try uploading again

### Solution 2: Restart Backend
```bash
# Stop backend (Ctrl+C in terminal)
# Then restart
cd apps/backend
npm start
```

This will:
- Recreate storage buckets if missing
- Reset all connections
- Apply latest timeout settings

### Solution 3: Clear Browser Cache
1. DevTools → Application tab
2. Clear localStorage
3. Clear Cookies
4. Clear Cache
5. Reload page and login again

### Solution 4: Check File Size
- Maximum file size: **5MB**
- Try with a smaller image (e.g., compress to 1-2MB)
- Use online tools: TinyPNG, ImageOptim

### Solution 5: Check Image Format
- Supported: JPEG, PNG, WebP
- Not supported: BMP, GIF, TIFF, SVG
- Try converting to PNG or JPEG

### Solution 6: Check Network/VPN
- If behind VPN/proxy, upload might be blocked
- Try on different network
- Check firewall settings

---

## Advanced Debugging

### Enable Extra Logging

Edit `apps/admin-panel/src/components/ImageUpload.jsx`:

Uncomment these lines to see detailed logs:
```javascript
console.log(`📤 Uploading ${fieldName}:`, { ... });
```

### Check Request Headers

In DevTools Network tab → Click upload request → Headers:

**Request Headers should include:**
- `Authorization: Bearer <token>`
- `Content-Type: multipart/form-data; boundary=...`

**Response Headers should include:**
- `Content-Type: application/json`

### Monitor Backend Performance

```bash
# Watch backend logs in real-time
tail -f apps/backend/logs/server.log
```

---

## Still Not Working?

Provide these details:

1. **Browser Console Error** (full message)
2. **Network Tab Status Code** (e.g., 401, 404, 500)
3. **Backend Error Log** (full message)
4. **File Details** (size, format, name)
5. **Your steps** (what you did before uploading)

## Quick Restart Procedure

```bash
# Terminal 1: Stop backend
cd apps/backend
npm start

# Terminal 2: Build and run admin panel
cd apps/admin-panel
npm run build

# Open browser: http://localhost:3000
# Login
# Try uploading
```

---

## Configuration Summary

| Setting | Value | Purpose |
|---------|-------|---------|
| Client Timeout | 30 minutes | Prevent timeout during upload |
| Server Socket Timeout | 30 minutes | Keep connection alive |
| Max File Size | 5MB | API limit |
| Rate Limit Skip | /uploads | No throttling on uploads |
| Content-Type | Auto (multipart/form-data) | Let axios handle it |
| Auth Required | Yes | Admin only |

---

**Last Updated:** January 22, 2026
**Tested On:** macOS, Node 18+, Supabase
