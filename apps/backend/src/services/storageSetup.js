import { supabase } from '../config/supabase.js';

/**
 * Initialize storage buckets if they don't exist
 */
export const initializeStorageBuckets = async () => {
  const buckets = [
    {
      name: 'athletes',
      public: true,
      fileSize: 5 * 1024 * 1024, // 5MB
      mimeTypes: ['image/jpeg', 'image/jpg', 'image/png', 'image/webp'],
    },
    {
      name: 'competitions',
      public: true,
      fileSize: 5 * 1024 * 1024,
      mimeTypes: ['image/jpeg', 'image/jpg', 'image/png', 'image/webp'],
    },
    {
      name: 'teams',
      public: true,
      fileSize: 5 * 1024 * 1024,
      mimeTypes: ['image/jpeg', 'image/jpg', 'image/png', 'image/webp'],
    },
  ];

  console.log('🔧 Initializing storage buckets...');

  for (const bucket of buckets) {
    try {
      // Check if bucket exists
      const { data: existingBuckets, error: listError } = await supabase.storage.listBuckets();
      
      if (listError) {
        console.error(`❌ Error listing buckets: ${listError.message}`);
        continue;
      }

      const bucketExists = existingBuckets?.some(b => b.name === bucket.name);

      if (!bucketExists) {
        // Create bucket
        const { data, error } = await supabase.storage.createBucket(bucket.name, {
          public: bucket.public,
          fileSizeLimit: bucket.fileSize,
          allowedMimeTypes: bucket.mimeTypes,
        });

        if (error) {
          console.error(`❌ Failed to create bucket '${bucket.name}': ${error.message}`);
        } else {
          console.log(`✅ Created bucket: ${bucket.name}`);
        }
      } else {
        console.log(`✅ Bucket already exists: ${bucket.name}`);
      }
    } catch (error) {
      console.error(`❌ Error initializing bucket '${bucket.name}':`, error);
    }
  }

  console.log('✅ Storage initialization complete');
};

export default initializeStorageBuckets;
