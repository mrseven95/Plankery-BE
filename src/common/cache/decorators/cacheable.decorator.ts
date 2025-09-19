import { UseInterceptors } from '@nestjs/common';
import { CacheInterceptor } from '../interceptors/cache.interceptor';

export const Cacheable = (key?: string, ttl?: number) => {
  return UseInterceptors(new CacheInterceptor(undefined, key, ttl));
};
