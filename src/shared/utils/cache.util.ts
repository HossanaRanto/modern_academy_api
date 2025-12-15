import type * as CacheManagerTypes from 'cache-manager';

/**
 * Cache utility class for managing Redis cache operations
 */
export class CacheUtil {
  /**
   * Delete cache keys matching a pattern
   * @param cacheManager Cache manager instance
   * @param pattern Pattern to match (e.g., 'class:all:*')
   */
  static async deletePattern(
    cacheManager: CacheManagerTypes.Cache,
    pattern: string,
  ): Promise<void> {
    // Get the Redis store from cache manager
    const store: any = cacheManager;
    
    if (store && store.store && store.store.client && typeof store.store.client.keys === 'function') {
      try {
        // Use Redis KEYS command to find matching keys
        const keys = await store.store.client.keys(pattern);
        
        if (keys && keys.length > 0) {
          // Delete all matching keys
          await Promise.all(keys.map((key: string) => cacheManager.del(key)));
        }
      } catch (error) {
        console.error(`Error deleting cache pattern ${pattern}:`, error);
      }
    }
  }

  /**
   * Delete multiple cache keys
   * @param cacheManager Cache manager instance
   * @param keys Array of cache keys to delete
   */
  static async deleteKeys(
    cacheManager: CacheManagerTypes.Cache,
    keys: string[],
  ): Promise<void> {
    await Promise.all(keys.map(key => cacheManager.del(key)));
  }

  /**
   * Generate a cache key for a tenant-scoped resource
   * @param resource Resource type (e.g., 'class', 'course')
   * @param identifier Identifier type (e.g., 'id', 'code', 'all')
   * @param value Value for the identifier
   * @param tenantId Optional tenant ID for multi-tenant caching
   */
  static generateKey(
    resource: string,
    identifier: string,
    value: string,
    tenantId?: string,
  ): string {
    if (tenantId) {
      return `${tenantId}:${resource}:${identifier}:${value}`;
    }
    return `${resource}:${identifier}:${value}`;
  }

  /**
   * Invalidate all caches for a specific resource
   * @param cacheManager Cache manager instance
   * @param resource Resource type (e.g., 'class', 'course')
   * @param tenantId Optional tenant ID
   */
  static async invalidateResource(
    cacheManager: CacheManagerTypes.Cache,
    resource: string,
    tenantId?: string,
  ): Promise<void> {
    const pattern = tenantId 
      ? `${tenantId}:${resource}:*`
      : `${resource}:*`;
    
    await CacheUtil.deletePattern(cacheManager, pattern);
  }
}
