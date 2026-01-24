# Supabase Storage Setup Guide

This guide explains how to set up Supabase Storage buckets for image uploads in the Lifting Live Arena system.

## Required Buckets

The system requires three storage buckets:

1. **athletes** - For athlete profile photos
2. **competitions** - For competition logos
3. **teams** - For team logos

---

## Step-by-Step Setup

### 1. Access Supabase Storage

1. Log in to your [Supabase Dashboard](https://app.supabase.com)
2. Select your project (`lifting-live-arena`)
3. Click **Storage** in the left sidebar
4. You'll see the Storage dashboard

### 2. Create Athletes Bucket

1. Click **"New bucket"** button
2. Fill in the details:
   - **Name**: `athletes`
   - **Public bucket**: Toggle **ON** (for easy image display)
   - **File size limit**: 5 MB (recommended)
   - **Allowed MIME types**: `image/jpeg,image/jpg,image/png,image/webp`
3. Click **"Create bucket"**

### 3. Create Competitions Bucket

1. Click **"New bucket"** button again
2. Fill in the details:
   - **Name**: `competitions`
   - **Public bucket**: Toggle **ON**
   - **File size limit**: 5 MB
   - **Allowed MIME types**: `image/jpeg,image/jpg,image/png,image/webp`
3. Click **"Create bucket"**

### 4. Create Teams Bucket

1. Click **"New bucket"** button again
2. Fill in the details:
   - **Name**: `teams`
   - **Public bucket**: Toggle **ON**
   - **File size limit**: 5 MB
   - **Allowed MIME types**: `image/jpeg,image/jpg,image/png,image/webp`
3. Click **"Create bucket"**

---

## Bucket Policies (Optional - for private buckets)

If you prefer **private** buckets (more secure), create these policies:

### Athletes Bucket Policy

```sql
-- Allow authenticated users to upload
CREATE POLICY "Authenticated users can upload athlete photos"
ON storage.objects FOR INSERT
TO authenticated
WITH CHECK (bucket_id = 'athletes');

-- Allow public read access
CREATE POLICY "Public can view athlete photos"
ON storage.objects FOR SELECT
TO public
USING (bucket_id = 'athletes');

-- Allow authenticated users to delete
CREATE POLICY "Authenticated users can delete athlete photos"
ON storage.objects FOR DELETE
TO authenticated
USING (bucket_id = 'athletes');
```

### Competitions Bucket Policy

```sql
-- Allow authenticated users to upload
CREATE POLICY "Authenticated users can upload competition logos"
ON storage.objects FOR INSERT
TO authenticated
WITH CHECK (bucket_id = 'competitions');

-- Allow public read access
CREATE POLICY "Public can view competition logos"
ON storage.objects FOR SELECT
TO public
USING (bucket_id = 'competitions');

-- Allow authenticated users to delete
CREATE POLICY "Authenticated users can delete competition logos"
ON storage.objects FOR DELETE
TO authenticated
USING (bucket_id = 'competitions');
```

### Teams Bucket Policy

```sql
-- Allow authenticated users to upload
CREATE POLICY "Authenticated users can upload team logos"
ON storage.objects FOR INSERT
TO authenticated
WITH CHECK (bucket_id = 'teams');

-- Allow public read access
CREATE POLICY "Public can view team logos"
ON storage.objects FOR SELECT
TO public
USING (bucket_id = 'teams');

-- Allow authenticated users to delete
CREATE POLICY "Authenticated users can delete team logos"
ON storage.objects FOR DELETE
TO authenticated
USING (bucket_id = 'teams');
```

---

## Verify Bucket Setup

### Using Supabase Dashboard

1. Go to **Storage** in left sidebar
2. You should see 3 buckets: `athletes`, `competitions`, `teams`
3. Click on each bucket to verify settings
4. Check that "Public" toggle is ON (or policies are set)

### Using SQL Query

Run this in Supabase SQL Editor:

```sql
SELECT name, public, file_size_limit, allowed_mime_types
FROM storage.buckets
WHERE name IN ('athletes', 'competitions', 'teams')
ORDER BY name;
```

Expected output:
```
name          | public | file_size_limit | allowed_mime_types
--------------+--------+-----------------+----------------------------------------
athletes      | true   | 5242880        | {image/jpeg,image/jpg,image/png,...}
competitions  | true   | 5242880        | {image/jpeg,image/jpg,image/png,...}
teams         | true   | 5242880        | {image/jpeg,image/jpg,image/png,...}
```

---

## Create Temp Directory for Exports

The export feature requires a temporary directory:

```bash
mkdir -p /Users/akilanishan/Desktop/Projects/WL\ System/WL-System/apps/backend/temp
```

Or from the project root:

```bash
mkdir -p apps/backend/temp
```

Add to `.gitignore` (should already be there):

```
apps/backend/temp/*
!apps/backend/temp/.gitkeep
```

---

## Testing Upload Functionality

### 1. Start the Backend

```bash
cd apps/backend
npm run dev
```

### 2. Start Admin Panel

```bash
cd apps/admin-panel
npm run dev
```

### 3. Test Image Upload

1. Log in to Admin Panel
2. Go to **Athletes** page
3. Click **"Add Athlete"**
4. Fill in athlete details
5. Click the **camera icon** or upload area
6. Select an image file (JPG, PNG, or WebP)
7. Click **"Create Athlete"**
8. Verify the image appears in the athlete card

### 4. Test Other Uploads

- **Competitions**: Go to Competitions → Create/Edit → Upload logo
- **Teams**: Go to Teams → Create/Edit → Upload logo

---

## Troubleshooting

### Error: "Bucket does not exist"

**Solution:**
1. Verify bucket names are exactly: `athletes`, `competitions`, `teams`
2. Check spelling (all lowercase, no spaces)
3. Refresh Supabase dashboard

### Error: "File size too large"

**Solution:**
1. Check bucket file size limit (should be at least 5 MB)
2. Compress image before uploading
3. Use WebP format for better compression

### Error: "MIME type not allowed"

**Solution:**
1. Verify allowed MIME types include: `image/jpeg`, `image/png`, `image/webp`
2. Update bucket settings if needed
3. Convert image to supported format

### Error: "Permission denied"

**Solution:**
1. Check bucket is PUBLIC or has proper policies
2. Verify user is authenticated
3. Check SUPABASE_SERVICE_ROLE_KEY is set in backend `.env`

### Images Not Displaying

**Solution:**
1. Verify bucket is PUBLIC
2. Check image URL in browser (should be accessible)
3. Check CORS settings in Supabase
4. Verify `SUPABASE_URL` in `.env` is correct

---

## Image URL Format

Images are stored with this URL pattern:

```
https://[project-id].supabase.co/storage/v1/object/public/[bucket]/[path]
```

Example:
```
https://xxxxxxxxxxxxx.supabase.co/storage/v1/object/public/athletes/athlete-123.jpg
```

The system automatically generates and stores these URLs in the database.

---

## Storage Best Practices

1. **Image Optimization**
   - Resize images to max 800x800px before upload
   - Use WebP format for best compression
   - Keep file sizes under 500 KB

2. **Naming Convention**
   - Athletes: `athlete-[id].[ext]`
   - Competitions: `competition-[id].[ext]`
   - Teams: `team-[id].[ext]`

3. **Cleanup**
   - Delete old images when updating
   - Backend automatically handles this

4. **Security**
   - Use public buckets for display performance
   - Or use private buckets with signed URLs
   - Never expose service role key in frontend

---

## Next Steps

After setting up storage:

1. ✅ All three buckets created
2. ✅ Bucket policies configured (if using private)
3. ✅ Temp directory created for exports
4. ⬜ Test image upload in Athletes page
5. ⬜ Test image upload in Competitions page
6. ⬜ Test image upload in Teams page
7. ⬜ Verify images display correctly

---

## Support

If you encounter issues:
1. Check Supabase Storage logs (Storage → Settings → Logs)
2. Check browser console for errors
3. Verify environment variables in `.env` files
4. Check backend logs for upload errors

Storage is now ready for use! 🎉
