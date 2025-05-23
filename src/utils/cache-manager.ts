
// Cache management utility for better performance
export class CacheManager {
  private static readonly CACHE_PREFIX = 'snt-cache-';
  private static readonly DEFAULT_TTL = 24 * 60 * 60 * 1000; // 24 hours

  static async set(key: string, data: any, ttl: number = this.DEFAULT_TTL): Promise<void> {
    try {
      const item = {
        data,
        timestamp: Date.now(),
        ttl
      };
      localStorage.setItem(this.CACHE_PREFIX + key, JSON.stringify(item));
    } catch (error) {
      console.warn('Failed to cache data:', error);
    }
  }

  static async get<T>(key: string): Promise<T | null> {
    try {
      const cached = localStorage.getItem(this.CACHE_PREFIX + key);
      if (!cached) return null;

      const item = JSON.parse(cached);
      const age = Date.now() - item.timestamp;

      if (age > item.ttl) {
        this.remove(key);
        return null;
      }

      return item.data;
    } catch (error) {
      console.warn('Failed to retrieve cached data:', error);
      return null;
    }
  }

  static remove(key: string): void {
    try {
      localStorage.removeItem(this.CACHE_PREFIX + key);
    } catch (error) {
      console.warn('Failed to remove cached data:', error);
    }
  }

  static clear(): void {
    try {
      const keys = Object.keys(localStorage).filter(key => 
        key.startsWith(this.CACHE_PREFIX)
      );
      keys.forEach(key => localStorage.removeItem(key));
    } catch (error) {
      console.warn('Failed to clear cache:', error);
    }
  }

  static async getOrFetch<T>(
    key: string, 
    fetchFn: () => Promise<T>, 
    ttl: number = this.DEFAULT_TTL
  ): Promise<T> {
    const cached = await this.get<T>(key);
    if (cached) return cached;

    const data = await fetchFn();
    await this.set(key, data, ttl);
    return data;
  }
}
