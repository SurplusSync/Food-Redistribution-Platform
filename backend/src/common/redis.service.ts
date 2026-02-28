import { Inject, Injectable } from '@nestjs/common';
import { CACHE_MANAGER } from '@nestjs/cache-manager';
import { Cache } from 'cache-manager';

@Injectable()
export class RedisService {
  constructor(@Inject(CACHE_MANAGER) private cacheManager: Cache) { }
  async deleteKeysByPattern(pattern: string): Promise<void> {
    const cache: any = this.cacheManager;
    const store = cache.store || (cache.stores && cache.stores[0]);
    if (store && typeof store.keys === 'function') {
      const keys = await store.keys(pattern);
      if (keys && keys.length > 0) {
        await Promise.all(
          keys.map((key: string) => this.cacheManager.del(key)),
        );
      }
    }
  }

  async deleteKey(key: string): Promise<void> {
    await this.cacheManager.del(key);
  }
}
