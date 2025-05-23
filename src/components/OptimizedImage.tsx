
import { useState, useEffect } from 'react';
import { CacheManager } from '@/utils/cache-manager';

interface OptimizedImageProps {
  src: string;
  alt: string;
  className?: string;
  width?: number;
  height?: number;
  loading?: 'lazy' | 'eager';
  placeholder?: string;
}

const OptimizedImage = ({
  src,
  alt,
  className = '',
  width,
  height,
  loading = 'lazy',
  placeholder = '/placeholder.svg',
}: OptimizedImageProps) => {
  const [imageSrc, setImageSrc] = useState(loading === 'eager' ? src : placeholder);
  const [isLoaded, setIsLoaded] = useState(false);
  const [error, setError] = useState(false);

  useEffect(() => {
    // Check if image is already cached
    const checkCachedImage = async () => {
      const cacheKey = `image-${src}`;
      const cached = await CacheManager.get(cacheKey);
      
      if (cached && loading === 'lazy') {
        setImageSrc(src);
        setIsLoaded(true);
        return;
      }

      // Only lazy load if specified and not cached
      if (loading === 'lazy' && !isLoaded) {
        const img = new Image();
        img.src = src;
        img.onload = () => {
          setImageSrc(src);
          setIsLoaded(true);
          // Cache successful load
          CacheManager.set(cacheKey, true, 7 * 24 * 60 * 60 * 1000); // 7 days
        };
        img.onerror = () => {
          setImageSrc(placeholder);
          setError(true);
        };
      }
    };

    checkCachedImage();
  }, [src, loading, isLoaded, placeholder]);

  return (
    <div className="relative">
      <img
        src={imageSrc}
        alt={alt}
        width={width}
        height={height}
        className={`${className} ${isLoaded ? 'opacity-100' : 'opacity-0'} transition-opacity duration-300`}
        onLoad={() => setIsLoaded(true)}
        onError={() => {
          setImageSrc(placeholder);
          setError(true);
        }}
        loading={loading}
      />
      
      {!isLoaded && !error && (
        <div className="absolute inset-0 flex items-center justify-center bg-gray-100 dark:bg-gray-800">
          <div className="w-8 h-8 border-4 border-gray-300 dark:border-gray-600 border-t-travel-gold rounded-full animate-spin"></div>
        </div>
      )}
    </div>
  );
};

export default OptimizedImage;
