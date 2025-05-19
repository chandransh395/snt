
import { supabase } from '@/integrations/supabase/client';

export const setupBlogMediaStorage = async () => {
  try {
    // Check if bucket already exists
    const { data: buckets } = await supabase.storage.listBuckets();
    const bucketExists = buckets?.some(bucket => bucket.name === 'blog-media');
    
    if (!bucketExists) {
      // Create the bucket
      const { error } = await supabase.storage.createBucket('blog-media', {
        public: true,
        allowedMimeTypes: ['image/png', 'image/jpeg', 'image/gif', 'image/webp', 'video/mp4'],
        fileSizeLimit: 10485760 // 10MB
      });
      
      if (error) {
        console.error('Error creating storage bucket:', error);
        return false;
      }
      
      return true;
    }
    
    return true;
  } catch (error) {
    console.error('Error setting up storage:', error);
    return false;
  }
};
