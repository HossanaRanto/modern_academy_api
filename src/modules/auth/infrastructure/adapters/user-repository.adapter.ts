import { Injectable, Inject } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { CACHE_MANAGER } from '@nestjs/cache-manager';
import type * as CacheManagerTypes from 'cache-manager';
import { User } from '../../../../entities/user.entity';
import { IUserRepository } from '../../application/ports/user-repository.port';

@Injectable()
export class UserRepositoryAdapter implements IUserRepository {
  constructor(
    @InjectRepository(User)
    private readonly userRepository: Repository<User>,
    @Inject(CACHE_MANAGER)
    private readonly cacheManager: CacheManagerTypes.Cache,
  ) {}

  async findByEmail(email: string): Promise<User | null> {
    const cacheKey = `user:email:${email}`;
    
    // Try cache first
    const cached = await this.cacheManager.get<User>(cacheKey);
    if (cached) {
      return cached;
    }
    
    const user = await this.userRepository.findOne({ where: { email } });
    
    // Cache if found
    if (user) {
      await this.cacheManager.set(cacheKey, user);
      await this.cacheManager.set(`user:id:${user.id}`, user);
    }
    
    return user;
  }

  async findById(id: string): Promise<User | null> {
    const cacheKey = `user:id:${id}`;
    
    // Try cache first
    const cached = await this.cacheManager.get<User>(cacheKey);
    if (cached) {
      return cached;
    }
    
    const user = await this.userRepository.findOne({ where: { id } });
    
    // Cache if found
    if (user) {
      await this.cacheManager.set(cacheKey, user);
    }
    
    return user;
  }

  async create(userData: Partial<User>): Promise<User> {
    const user = this.userRepository.create(userData);
    const saved = await this.userRepository.save(user);
    
    // Cache the new user
    await this.cacheManager.set(`user:id:${saved.id}`, saved);
    await this.cacheManager.set(`user:email:${saved.email}`, saved);
    
    return saved;
  }

  async save(user: User): Promise<User> {
    const saved = await this.userRepository.save(user);
    
    // Invalidate and update cache
    await this.cacheManager.del(`user:id:${saved.id}`);
    await this.cacheManager.del(`user:email:${saved.email}`);
    
    await this.cacheManager.set(`user:id:${saved.id}`, saved);
    await this.cacheManager.set(`user:email:${saved.email}`, saved);
    
    return saved;
  }
}
