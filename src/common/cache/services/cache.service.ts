import { Injectable, Inject } from '@nestjs/common';
import { CACHE_MANAGER } from '@nestjs/cache-manager';
import type { Cache } from 'cache-manager';

@Injectable()
export class CacheService {
  constructor(@Inject(CACHE_MANAGER) private cacheManager: Cache) {}

  async get<T>(key: string): Promise<T | undefined> {
    return this.cacheManager.get<T>(key);
  }

  async set<T>(key: string, value: T, ttl?: number): Promise<void> {
    await this.cacheManager.set(key, value, ttl);
  }

  async del(key: string): Promise<void> {
    await this.cacheManager.del(key);
  }

  async reset(): Promise<void> {
    // eslint-disable-next-line @typescript-eslint/no-unsafe-call, @typescript-eslint/no-unsafe-member-access
    await (this.cacheManager as any).reset();
  }

  keys(pattern?: string): Promise<string[]> {
    // eslint-disable-next-line @typescript-eslint/no-unsafe-call, @typescript-eslint/no-unsafe-member-access, @typescript-eslint/no-unsafe-return
    return (this.cacheManager as any).store?.keys?.(pattern) || [];
  }

  // Helper methods for common cache patterns
  async getOrSet<T>(key: string, factory: () => Promise<T>, ttl?: number): Promise<T> {
    const cached = await this.get<T>(key);
    if (cached !== undefined) {
      return cached;
    }

    const value = await factory();
    await this.set(key, value, ttl);
    return value;
  }

  async invalidatePattern(pattern: string): Promise<void> {
    const keys = await this.keys(pattern);
    await Promise.all(keys.map(key => this.del(key)));
  }

  // User-specific cache methods
  async getUserCache<T>(userId: string, key: string): Promise<T | undefined> {
    return this.get<T>(`user:${userId}:${key}`);
  }

  async setUserCache<T>(userId: string, key: string, value: T, ttl?: number): Promise<void> {
    await this.set(`user:${userId}:${key}`, value, ttl);
  }

  async invalidateUserCache(userId: string, pattern?: string): Promise<void> {
    const searchPattern = pattern ? `user:${userId}:${pattern}` : `user:${userId}:*`;
    await this.invalidatePattern(searchPattern);
  }
}
