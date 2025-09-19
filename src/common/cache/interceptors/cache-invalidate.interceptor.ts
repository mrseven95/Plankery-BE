import { Injectable, NestInterceptor, ExecutionContext, CallHandler } from '@nestjs/common';
import { Observable } from 'rxjs';
import { tap } from 'rxjs/operators';
import { CacheService } from '../services/cache.service';

@Injectable()
export class CacheInvalidateInterceptor implements NestInterceptor {
  constructor(
    private readonly cacheService?: CacheService,
    private readonly pattern?: string,
  ) {}

  intercept(context: ExecutionContext, next: CallHandler): Observable<any> {
    return next.handle().pipe(
      tap(() => {
        if (!this.cacheService) {
          return;
        }

        if (this.pattern) {
          void this.cacheService.invalidatePattern(this.pattern);
        } else {
          // Default: invalidate all cache
          void this.cacheService.reset();
        }
      }),
    );
  }
}
