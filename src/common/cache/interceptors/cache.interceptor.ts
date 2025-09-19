import { Injectable, NestInterceptor, ExecutionContext, CallHandler } from '@nestjs/common';
import { Observable, of } from 'rxjs';
import { tap } from 'rxjs/operators';
import { CacheService } from '../services/cache.service';

@Injectable()
export class CacheInterceptor implements NestInterceptor {
  constructor(
    private readonly cacheService?: CacheService,
    private readonly key?: string,
    private readonly ttl?: number,
  ) {}

  async intercept(context: ExecutionContext, next: CallHandler): Promise<Observable<any>> {
    if (!this.cacheService) {
      return next.handle();
    }

    // eslint-disable-next-line @typescript-eslint/no-unsafe-assignment
    const request = context.switchToHttp().getRequest();
    const cacheKey = this.generateCacheKey(request);

    // Try to get from cache
    const cachedResult = await this.cacheService.get(cacheKey);
    if (cachedResult) {
      return of(cachedResult);
    }

    // Execute the method and cache the result
    return next.handle().pipe(
      tap(result => {
        void this.cacheService!.set(cacheKey, result, this.ttl);
      }),
    );
  }

  private generateCacheKey(request: any): string {
    if (this.key) {
      return this.key;
    }

    // eslint-disable-next-line @typescript-eslint/no-unsafe-assignment
    const { method, url, params, query, body } = request;
    // eslint-disable-next-line @typescript-eslint/no-unsafe-assignment, @typescript-eslint/no-unsafe-member-access
    const userId = request.user?.id || request.user?._id;

    // Create a unique key based on request details
    const keyParts = [
      method,
      url,
      userId ? `user:${userId}` : 'anonymous',
      JSON.stringify(params),
      JSON.stringify(query),
      method === 'POST' || method === 'PUT' || method === 'PATCH' ? JSON.stringify(body) : '',
    ];

    return keyParts.filter(Boolean).join(':');
  }
}
