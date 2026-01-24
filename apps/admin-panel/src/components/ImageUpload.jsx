import { useState, useRef } from 'react';
import { Upload, X, Image as ImageIcon, Loader2 } from 'lucide-react';
import axios from 'axios';
import api from '../services/api';
import toast from 'react-hot-toast';

export default function ImageUpload({ 
  currentImageUrl, 
  uploadEndpoint, 
  onUploadSuccess,
  label = 'Upload Image',
  maxSizeMB = 5,
  accept = 'image/jpeg,image/jpg,image/png,image/webp'
}) {
  const [uploading, setUploading] = useState(false);
  const [preview, setPreview] = useState(currentImageUrl);
  const fileInputRef = useRef(null);

  const handleFileSelect = async (e) => {
    const file = e.target.files?.[0];
    if (!file) return;

    // Validate file size
    const maxSize = maxSizeMB * 1024 * 1024;
    if (file.size > maxSize) {
      toast.error(`File too large. Maximum size is ${maxSizeMB}MB`);
      return;
    }

    // Validate file type
    const allowedTypes = accept.split(',');
    if (!allowedTypes.some(type => file.type === type.trim())) {
      toast.error('Invalid file type. Only JPEG, PNG, and WebP are allowed');
      return;
    }

    // Create preview
    const reader = new FileReader();
    reader.onloadend = () => {
      setPreview(reader.result);
    };
    reader.readAsDataURL(file);

    // Upload file
    try {
      setUploading(true);
      const formData = new FormData();
      const fieldName = uploadEndpoint.includes('photo') ? 'photo' : 'logo';
      formData.append(fieldName, file);

      console.log(`📤 Uploading ${fieldName}:`, {
        filename: file.name,
        size: file.size,
        type: file.type,
        endpoint: uploadEndpoint,
      });

      // Create axios instance with extended timeout for this upload
      const uploadApi = axios.create({
        baseURL: api.defaults.baseURL,
        timeout: 30 * 60 * 1000, // 30 minutes timeout for uploads
        headers: {
          // Don't set Content-Type - let axios/browser handle it for FormData
          // This is critical for multipart/form-data with boundary
        },
      });
      
      // Add auth token
      const token = localStorage.getItem('token');
      if (token) {
        uploadApi.defaults.headers.common.Authorization = `Bearer ${token}`;
      }

      // Remove any JSON content-type that might have been set
      delete uploadApi.defaults.headers.common['Content-Type'];

      toast.loading('Uploading image... please wait', { duration: 0, id: 'upload-progress' });
      const response = await uploadApi.post(uploadEndpoint, formData);

      console.log('✅ Upload successful:', response.data);
      toast.success('Image uploaded successfully');
      toast.dismiss('upload-progress');
      
      if (onUploadSuccess) {
        onUploadSuccess(response.data.data);
      }
    } catch (error) {
      console.error('❌ Upload error:', {
        message: error.message,
        code: error.code,
        status: error.response?.status,
        data: error.response?.data,
        config: {
          url: error.config?.url,
          method: error.config?.method,
          timeout: error.config?.timeout,
        }
      });
      
      toast.dismiss('upload-progress');
      
      // Provide specific error messages
      let errorMsg = 'Failed to upload image';
      if (error.code === 'ECONNABORTED' || error.message?.includes('timeout')) {
        errorMsg = 'Upload timed out. Please check your connection and try with a smaller image.';
      } else if (error.response?.status === 413) {
        errorMsg = 'File too large. Maximum size is 5MB.';
      } else if (error.response?.status === 408) {
        errorMsg = 'Request timeout. Please check your internet connection and try again.';
      } else if (error.response?.status === 401) {
        errorMsg = 'Session expired. Please login again and try uploading.';
      } else if (error.response?.data?.error?.message) {
        errorMsg = error.response.data.error.message;
      } else if (error.message) {
        errorMsg = error.message;
      }
      
      toast.error(errorMsg);
      setPreview(currentImageUrl); // Revert preview on error
    } finally {
      setUploading(false);
    }
  };

  const handleDelete = async () => {
    if (!currentImageUrl) return;

    if (!window.confirm('Are you sure you want to delete this image?')) {
      return;
    }

    try {
      setUploading(true);
      await api.delete(uploadEndpoint);
      
      setPreview(null);
      toast.success('Image deleted successfully');
      
      if (onUploadSuccess) {
        onUploadSuccess({ photoUrl: null, logoUrl: null });
      }
    } catch (error) {
      console.error('Delete error:', error);
      toast.error('Failed to delete image');
    } finally {
      setUploading(false);
    }
  };

  return (
    <div className="space-y-3">
      <label className="block text-sm font-medium text-slate-700 dark:text-zinc-300">
        {label}
      </label>

      <div className="flex items-start gap-4">
        {/* Image Preview */}
        <div className="w-32 h-32 flex-shrink-0 bg-slate-100 dark:bg-zinc-800 rounded-xl overflow-hidden border-2 border-slate-200 dark:border-zinc-700 relative group">
          {preview ? (
            <>
              <img 
                src={preview} 
                alt="Preview" 
                className="w-full h-full object-cover"
              />
              {currentImageUrl && !uploading && (
                <button
                  onClick={handleDelete}
                  className="absolute top-2 right-2 p-1.5 bg-red-600 hover:bg-red-700 text-white rounded-lg opacity-0 group-hover:opacity-100 transition-opacity"
                  title="Delete image"
                >
                  <X size={16} />
                </button>
              )}
            </>
          ) : (
            <div className="w-full h-full flex items-center justify-center text-slate-400 dark:text-zinc-600">
              <ImageIcon size={32} />
            </div>
          )}
          
          {uploading && (
            <div className="absolute inset-0 bg-black/50 flex items-center justify-center">
              <Loader2 className="text-white animate-spin" size={24} />
            </div>
          )}
        </div>

        {/* Upload Button */}
        <div className="flex-1">
          <input
            ref={fileInputRef}
            type="file"
            accept={accept}
            onChange={handleFileSelect}
            className="hidden"
            disabled={uploading}
          />
          
          <button
            onClick={() => fileInputRef.current?.click()}
            disabled={uploading}
            className="w-full btn btn-secondary flex items-center justify-center gap-2"
          >
            <Upload size={20} />
            <span>{uploading ? 'Uploading...' : preview ? 'Change Image' : 'Upload Image'}</span>
          </button>
          
          <p className="mt-2 text-xs text-slate-500 dark:text-zinc-500">
            JPEG, PNG, or WebP • Max {maxSizeMB}MB
          </p>
        </div>
      </div>
    </div>
  );
}
