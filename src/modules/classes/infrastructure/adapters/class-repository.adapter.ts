import { Injectable, Inject } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { CACHE_MANAGER } from '@nestjs/cache-manager';
import type * as CacheManagerTypes from 'cache-manager';
import { Class } from '../../../../entities/class.entity';
import { IClassRepository } from '../../application/ports/class-repository.port';

@Injectable()
export class ClassRepositoryAdapter implements IClassRepository {
  constructor(
    @InjectRepository(Class)
    private readonly classRepository: Repository<Class>,
    @Inject(CACHE_MANAGER)
    private readonly cacheManager: CacheManagerTypes.Cache,
  ) {}

  async findByCode(code: string): Promise<Class | null> {
    const cacheKey = `class:code:${code}`;
    
    const cached = await this.cacheManager.get<Class>(cacheKey);
    if (cached) {
      return cached;
    }

    const classEntity = await this.classRepository.findOne({ where: { code } });
    
    if (classEntity) {
      await this.cacheManager.set(cacheKey, classEntity);
    }
    
    return classEntity;
  }

  async findById(id: string): Promise<Class | null> {
    const cacheKey = `class:id:${id}`;
    
    const cached = await this.cacheManager.get<Class>(cacheKey);
    if (cached) {
      return cached;
    }

    const classEntity = await this.classRepository.findOne({ where: { id } });
    
    if (classEntity) {
      await this.cacheManager.set(cacheKey, classEntity);
    }
    
    return classEntity;
  }

  async findAll(academyId: string): Promise<Class[]> {
    const cacheKey = `class:all:${academyId}`;
    
    const cached = await this.cacheManager.get<Class[]>(cacheKey);
    if (cached) {
      return cached;
    }

    const classes = await this.classRepository.find({
      order: { level: 'ASC', name: 'ASC' },
    });
    
    await this.cacheManager.set(cacheKey, classes);
    
    return classes;
  }

  async findAllActive(academyId: string): Promise<Class[]> {
    const cacheKey = `class:active:${academyId}`;
    
    const cached = await this.cacheManager.get<Class[]>(cacheKey);
    if (cached) {
      return cached;
    }

    const classes = await this.classRepository.find({
      where: { isActive: true },
      order: { level: 'ASC', name: 'ASC' },
    });
    
    await this.cacheManager.set(cacheKey, classes);
    
    return classes;
  }

  async create(classData: Partial<Class>): Promise<Class> {
    const classEntity = this.classRepository.create(classData);
    const saved = await this.classRepository.save(classEntity);
    
    await this.cacheManager.set(`class:id:${saved.id}`, saved);
    await this.cacheManager.set(`class:code:${saved.code}`, saved);
    
    // Invalidate list caches
    await this.cacheManager.del('class:all:*');
    await this.cacheManager.del('class:active:*');
    
    return saved;
  }

  async save(classEntity: Class): Promise<Class> {
    const saved = await this.classRepository.save(classEntity);
    
    await this.cacheManager.del(`class:id:${saved.id}`);
    await this.cacheManager.del(`class:code:${saved.code}`);
    await this.cacheManager.set(`class:id:${saved.id}`, saved);
    await this.cacheManager.set(`class:code:${saved.code}`, saved);
    
    // Invalidate list caches
    await this.cacheManager.del('class:all:*');
    await this.cacheManager.del('class:active:*');
    
    return saved;
  }

  async delete(id: string): Promise<void> {
    const classEntity = await this.findById(id);
    if (classEntity) {
      await this.classRepository.delete(id);
      
      await this.cacheManager.del(`class:id:${id}`);
      await this.cacheManager.del(`class:code:${classEntity.code}`);
      await this.cacheManager.del('class:all:*');
      await this.cacheManager.del('class:active:*');
    }
  }
}
