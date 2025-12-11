import { CacheModuleOptions, CacheOptionsFactory } from '@nestjs/cache-manager';
import { Injectable } from '@nestjs/common';
import { redisStore } from 'cache-manager-redis-yet';

@Injectable()
export class CacheConfigService implements CacheOptionsFactory {
  async createCacheOptions(): Promise<CacheModuleOptions> {
    const redisHost = process.env.REDIS_HOST || 'localhost';
    const redisPort = parseInt(process.env.REDIS_PORT || '6379', 10);
    const ttl = parseInt(process.env.REDIS_TTL || '300', 10) * 1000; // Convert to milliseconds

    const store = await redisStore({
      socket: {
        host: redisHost,
        port: redisPort,
      },
    });

    return {
      store: store as any,
      ttl,
    };
  }
}
