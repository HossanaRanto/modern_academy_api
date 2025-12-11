import { Injectable, Inject } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { CACHE_MANAGER } from '@nestjs/cache-manager';
import type * as CacheManagerTypes from 'cache-manager';
import { Academy } from '../../../../entities/academy.entity';
import { IAcademyRepository } from '../../application/ports/academy-repository.port';

@Injectable()
export class AcademyRepositoryAdapter implements IAcademyRepository {
  constructor(
    @InjectRepository(Academy)
    private readonly academyRepository: Repository<Academy>,
    @Inject(CACHE_MANAGER)
    private readonly cacheManager: CacheManagerTypes.Cache,
  ) {}

  async findByCode(code: string): Promise<Academy | null> {
    const cacheKey = `academy:code:${code}`;
    
    // Try to get from cache
    const cached = await this.cacheManager.get<Academy>(cacheKey);
    if (cached) {
      return cached;
    }

    // If not in cache, fetch from database
    const academy = await this.academyRepository.findOne({ where: { code } });
    
    // Store in cache if found
    if (academy) {
      await this.cacheManager.set(cacheKey, academy);
    }
    
    return academy;
  }

  async findById(id: string): Promise<Academy | null> {
    const cacheKey = `academy:id:${id}`;
    
    // Try to get from cache
    const cached = await this.cacheManager.get<Academy>(cacheKey);
    if (cached) {
      return cached;
    }

    // If not in cache, fetch from database
    const academy = await this.academyRepository.findOne({ where: { id } });
    
    // Store in cache if found
    if (academy) {
      await this.cacheManager.set(cacheKey, academy);
    }
    
    return academy;
  }

  async findByUserId(userId: string): Promise<Academy | null> {
    const cacheKey = `academy:user:${userId}`;
    
    // Try to get from cache
    const cached = await this.cacheManager.get<Academy>(cacheKey);
    if (cached) {
      return cached;
    }

    // If not in cache, fetch from database
    const academy = await this.academyRepository.findOne({
      where: { users: { id: userId } },
      relations: ['users'],
    });
    
    // Store in cache if found
    if (academy) {
      await this.cacheManager.set(cacheKey, academy);
    }
    
    return academy;
  }

  async create(academyData: Partial<Academy>): Promise<Academy> {
    const academy = this.academyRepository.create(academyData);
    const saved = await this.academyRepository.save(academy);
    
    // Invalidate related caches and cache the new academy
    await this.cacheManager.set(`academy:id:${saved.id}`, saved);
    await this.cacheManager.set(`academy:code:${saved.code}`, saved);
    
    return saved;
  }

  async save(academy: Academy): Promise<Academy> {
    const saved = await this.academyRepository.save(academy);
    
    // Invalidate related caches
    await this.cacheManager.del(`academy:id:${saved.id}`);
    await this.cacheManager.del(`academy:code:${saved.code}`);
    
    // Update cache
    await this.cacheManager.set(`academy:id:${saved.id}`, saved);
    await this.cacheManager.set(`academy:code:${saved.code}`, saved);
    
    return saved;
  }
}
