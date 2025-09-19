import { UseInterceptors } from '@nestjs/common';
import { CacheInvalidateInterceptor } from '../interceptors/cache-invalidate.interceptor';

export const CacheInvalidate = (pattern?: string) => {
  return UseInterceptors(new CacheInvalidateInterceptor(undefined, pattern));
};
