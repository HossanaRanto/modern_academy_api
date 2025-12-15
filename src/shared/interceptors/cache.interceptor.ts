import {
  Injectable,
  NestInterceptor,
  ExecutionContext,
  CallHandler,
  Inject,
} from '@nestjs/common';
import { Observable, of } from 'rxjs';
import { tap } from 'rxjs/operators';
import { CACHE_MANAGER } from '@nestjs/cache-manager';
import type * as CacheManagerTypes from 'cache-manager';
import { Reflector } from '@nestjs/core';
import { CACHE_KEY_METADATA, CACHE_TTL_METADATA } from '../decorators/cache.decorator';

@Injectable()
export class CacheInterceptor implements NestInterceptor {
  constructor(
    @Inject(CACHE_MANAGER)
    private readonly cacheManager: CacheManagerTypes.Cache,
    private readonly reflector: Reflector,
  ) {}

  async intercept(
    context: ExecutionContext,
    next: CallHandler,
  ): Promise<Observable<any>> {
    const request = context.switchToHttp().getRequest();
    const handler = context.getHandler();
    
    // Get cache key pattern from metadata
    const cacheKeyPattern = this.reflector.get<string>(
      CACHE_KEY_METADATA,
      handler,
    );
    
    // If no cache key is set, skip caching
    if (!cacheKeyPattern) {
      return next.handle();
    }
    
    // Get custom TTL if set
    const customTTL = this.reflector.get<number>(
      CACHE_TTL_METADATA,
      handler,
    );
    
    // Generate cache key by replacing :param with actual values
    const cacheKey = this.generateCacheKey(cacheKeyPattern, request);
    
    // Try to get from cache
    const cachedResponse = await this.cacheManager.get(cacheKey);
    if (cachedResponse) {
      return of(cachedResponse);
    }
    
    // If not in cache, execute the handler and cache the result
    return next.handle().pipe(
      tap(async (response) => {
        if (response !== null && response !== undefined) {
          if (customTTL) {
            await this.cacheManager.set(cacheKey, response, customTTL * 1000);
          } else {
            await this.cacheManager.set(cacheKey, response);
          }
        }
      }),
    );
  }

  private generateCacheKey(pattern: string, request: any): string {
    let key = pattern;
    
    // Replace :param with actual param values
    if (request.params) {
      Object.keys(request.params).forEach((param) => {
        key = key.replace(`:${param}`, request.params[param]);
      });
    }
    
    // Add query params to the key if present
    if (request.query && Object.keys(request.query).length > 0) {
      const queryString = Object.keys(request.query)
        .sort()
        .map(k => `${k}=${request.query[k]}`)
        .join('&');
      key = `${key}?${queryString}`;
    }
    
    // Add user context if available
    if (request.user?.id) {
      key = `user:${request.user.id}:${key}`;
    }
    
    // Add tenant context if available
    if (request.tenantId) {
      key = `tenant:${request.tenantId}:${key}`;
    }
    
    // Add academic year context if available
    if (request.academicYearId) {
      key = `ay:${request.academicYearId}:${key}`;
    }
    
    return key;
  }
}
