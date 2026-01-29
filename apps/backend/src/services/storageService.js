const { supabase } = require('../config/supabase.js');
const { AppError } = require('../middleware/errorHandler.js');

/**
 * Upload file to Supabase Storage
 */
const uploadFile = async (bucket, path, file, options = {}) => {
  try {
    const uploadOptions = {
      cacheControl: '3600',
      upsert: options.upsert || false,
    };

    // Only add contentType if provided
    if (options.contentType) {
      uploadOptions.contentType = options.contentType;
    }

    console.log(`📤 Uploading file to bucket '${bucket}' at path '${path}'`);

    const { data, error } = await supabase.storage
      .from(bucket)
      .upload(path, file, uploadOptions);

    if (error) {
      console.error(`❌ Storage upload error:`, error);
      throw new AppError(`Upload failed: ${error.message}`, 400);
    }

    console.log(`✅ File uploaded successfully:`, data);

    // Get public URL
    const { data: urlData } = supabase.storage
      .from(bucket)
      .getPublicUrl(path);

    console.log(`🔗 Public URL:`, urlData.publicUrl);

    return {
      path: data.path,
      publicUrl: urlData.publicUrl,
    };
  } catch (error) {
    console.error('💥 Storage upload error:', error);
    throw error;
  }
};

/**
 * Delete file from Supabase Storage
 */
const deleteFile = async (bucket, path) => {
  try {
    const { error } = await supabase.storage
      .from(bucket)
      .remove([path]);

    if (error) {
      throw new AppError(`Delete failed: ${error.message}`, 400);
    }

    return { success: true };
  } catch (error) {
    console.error('Storage delete error:', error);
    throw error;
  }
};

/**
 * Get public URL for file
 */
const getPublicUrl = (bucket, path) => {
  const { data } = supabase.storage
    .from(bucket)
    .getPublicUrl(path);

  return data.publicUrl;
};

/**
 * List files in bucket path
 */
const listFiles = async (bucket, path = '') => {
  try {
    const { data, error } = await supabase.storage
      .from(bucket)
      .list(path);

    if (error) {
      throw new AppError(`List failed: ${error.message}`, 400);
    }

    return data;
  } catch (error) {
    console.error('Storage list error:', error);
    throw error;
  }
};

/**
 * Generate unique filename with timestamp
 */
const generateUniqueFileName = (originalName) => {
  const timestamp = Date.now();
  const randomStr = Math.random().toString(36).substring(2, 8);
  const ext = originalName.split('.').pop();
  const nameWithoutExt = originalName.replace(/\.[^/.]+$/, '');
  const sanitized = nameWithoutExt.replace(/[^a-z0-9]/gi, '_').toLowerCase();
  
  return `${sanitized}_${timestamp}_${randomStr}.${ext}`;
};

/**
 * Validate image file
 */
const validateImageFile = (file, maxSizeMB = 5) => {
  const allowedTypes = ['image/jpeg', 'image/jpg', 'image/png', 'image/webp'];
  const maxSizeBytes = maxSizeMB * 1024 * 1024;

  if (!file) {
    throw new AppError('No file provided', 400);
  }

  if (!allowedTypes.includes(file.mimetype)) {
    throw new AppError('Invalid file type. Only JPEG, PNG, and WebP are allowed', 400);
  }

  if (file.size > maxSizeBytes) {
    throw new AppError(`File too large. Maximum size is ${maxSizeMB}MB`, 400);
  }

  return true;
};
