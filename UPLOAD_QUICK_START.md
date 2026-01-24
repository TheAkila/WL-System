# Image Upload - Quick Start Guide

## ✅ Pre-Flight Checklist

Before you upload:

1. **Backend Running?**
   ```bash
   cd apps/backend
   npm start
   # Should show: "🚀 Server running on port 5000"
   ```

2. **Admin Panel Built?**
   ```bash
   cd apps/admin-panel
   npm run build
   # Should show: "✓ built in X.XXs"
   ```

3. **Admin Panel Open?**
   - Navigate to: http://localhost:3000
   - Should see login page

4. **Logged In?**
   - Email: admin@example.com
   - Password: admin123
   - Should see admin dashboard

5. **Competition Exists?**
   - Go to "Competition Settings"
   - Should see a competition (or create one first)
   - Copy the Competition ID from URL or database

---

## 🚀 Upload Steps

### For Competition Logo:

1. Go to **Admin Panel** → **Competition Settings**
2. Click **Edit Competition** button
3. Scroll down to **"Competition Logo"** section
4. Click **"Upload Image"** button
5. Select an image (JPEG, PNG, or WebP - under 5MB)
6. Wait for toast message: "Uploading image... please wait"
7. Should see: ✅ "Image uploaded successfully"

### For Athlete Photo:

1. Go to **Athletes** page
2. Find an athlete
3. Click edit icon
4. Scroll to **"Athlete Photo"** section
5. Click **"Upload Image"**
6. Select image (JPEG, PNG, WebP - under 5MB)
7. Wait for upload to complete

---

## ❌ If Upload Fails

### Check 1: Browser Console (Press F12)
Look for lines like:
- `📤 Uploading photo: { filename: "...", size: ..., type: ... }`
- `✅ Upload successful:` (success)
- `❌ Upload error: { message: "...", status: ... }` (error)

**Copy the error message and error status code**

### Check 2: Network Tab (Press F12 → Network)
1. Try uploading
2. Look for request to `/api/uploads/...`
3. Check "Status" column:
   - **200** = Upload worked (data saved)
   - **401** = Not logged in, login again
   - **404** = ID not found, try another
   - **413** = File too large, use smaller image
   - **408/504** = Timeout, backend might be down
   - **500** = Server error, check backend console

### Check 3: Backend Console
Look for these messages:
```
📸 Uploading athlete photo for athlete: [ID]
📄 File info: { name: "...", size: ..., mime: "..." }
🔄 Uploading to path: photos/[filename]
✅ Upload successful. URL: [url]
```

If you see error message, copy it.

### Check 4: Image File
- **Size:** Must be under 5MB (try 1-2MB max)
- **Format:** JPEG, PNG, or WebP only
- **Try:** Different image file, even if first looks fine

### Check 5: Login Status
- Your session might have expired
- Go to login page
- Log in again with: admin@example.com / admin123
- Try uploading again

---

## 🔧 Nuclear Option - Full Reset

If nothing works:

```bash
# 1. Stop backend (Ctrl+C if running)

# 2. Stop frontend dev server if running

# 3. Clear frontend build
cd apps/admin-panel
rm -rf dist node_modules
npm install
npm run build

# 4. Go to backend
cd ../backend

# 5. Start backend fresh
npm start

# Should see in console:
# 🚀 Server running on port 5000
# ✅ Bucket already exists: athletes
# ✅ Bucket already exists: competitions
# ✅ Bucket already exists: teams
```

# 6. Open http://localhost:3000 in browser
# 7. Login
# 8. Try uploading

---

## 📊 Expected Behavior Timeline

| Action | Expected | Time |
|--------|----------|------|
| Select file | Preview appears | Instant |
| Click Upload | "Uploading..." message | Instant |
| Upload progress | Toast stays visible | 5-60 sec |
| Success | ✅ Toast, image displays | <2 sec |
| Error | ❌ Toast with error msg | <2 sec |

---

## 🆘 Getting Help

If still not working, provide:

1. **Screenshot or full error message** from browser console
2. **Status code** from Network tab (200, 401, 404, 500, etc)
3. **Backend console output** - copy the error lines
4. **File details** - size (in MB), format (JPEG/PNG), filename
5. **What you did** - which page, which button, etc

---

## ✨ Key Facts

- Upload timeout: 30 minutes ⏱️
- Max file size: 5MB 📏
- Supported formats: JPEG, PNG, WebP 🖼️
- Auth required: Yes (must be admin) 🔐
- Buckets auto-created: Yes (on backend start) 📦
- Test file: Any image under 5MB ✅

**IMPORTANT:** Backend must be running with latest code for uploads to work!
