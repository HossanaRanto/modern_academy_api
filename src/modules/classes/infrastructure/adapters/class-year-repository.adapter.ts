import { Injectable, Inject } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { CACHE_MANAGER } from '@nestjs/cache-manager';
import type * as CacheManagerTypes from 'cache-manager';
import { ClassYear } from '../../../../entities/class-year.entity';
import { IClassYearRepository } from '../../application/ports/class-year-repository.port';
import { CacheUtil } from '../../../../shared/utils/cache.util';

@Injectable()
export class ClassYearRepositoryAdapter implements IClassYearRepository {
  constructor(
    @InjectRepository(ClassYear)
    private readonly classYearRepository: Repository<ClassYear>,
    @Inject(CACHE_MANAGER)
    private readonly cacheManager: CacheManagerTypes.Cache,
  ) {}

  async findById(id: string): Promise<ClassYear | null> {
    const cacheKey = `class-year:id:${id}`;
    
    const cached = await this.cacheManager.get<ClassYear>(cacheKey);
    if (cached) {
      return cached;
    }

    const classYear = await this.classYearRepository.findOne({ 
      where: { id },
      relations: ['class'],
    });
    
    if (classYear) {
      await this.cacheManager.set(cacheKey, classYear);
    }
    
    return classYear;
  }

  async findByClassAndAcademicYear(classId: string, academicYearId: string): Promise<ClassYear | null> {
    const cacheKey = `class-year:${classId}:${academicYearId}`;
    
    const cached = await this.cacheManager.get<ClassYear>(cacheKey);
    if (cached) {
      return cached;
    }

    const classYear = await this.classYearRepository.findOne({
      where: { classId, academicYearId },
      relations: ['class'],
    });
    
    if (classYear) {
      await this.cacheManager.set(cacheKey, classYear);
    }
    
    return classYear;
  }

  async findByAcademicYear(academicYearId: string): Promise<ClassYear[]> {
    const cacheKey = `class-year:academic-year:${academicYearId}`;
    
    const cached = await this.cacheManager.get<ClassYear[]>(cacheKey);
    if (cached) {
      return cached;
    }

    const classYears = await this.classYearRepository.find({
      where: { academicYearId },
      relations: ['class'],
      order: { class: { level: 'ASC', name: 'ASC' } },
    });
    
    await this.cacheManager.set(cacheKey, classYears);
    
    return classYears;
  }

  async findByClass(classId: string): Promise<ClassYear[]> {
    const cacheKey = `class-year:class:${classId}`;
    
    const cached = await this.cacheManager.get<ClassYear[]>(cacheKey);
    if (cached) {
      return cached;
    }

    const classYears = await this.classYearRepository.find({
      where: { classId },
      relations: ['academicYear'],
      order: { academicYear: { startDate: 'DESC' } },
    });
    
    await this.cacheManager.set(cacheKey, classYears);
    
    return classYears;
  }

  async create(classYearData: Partial<ClassYear>): Promise<ClassYear> {
    const classYear = this.classYearRepository.create(classYearData);
    const saved = await this.classYearRepository.save(classYear);
    
    // Cache the new entity
    await this.cacheManager.set(`class-year:id:${saved.id}`, saved);
    await this.cacheManager.set(`class-year:${saved.classId}:${saved.academicYearId}`, saved);
    
    // Invalidate list caches
    await CacheUtil.deletePattern(this.cacheManager, `class-year:academic-year:${saved.academicYearId}`);
    await CacheUtil.deletePattern(this.cacheManager, `class-year:class:${saved.classId}`);
    
    return saved;
  }

  async save(classYear: ClassYear): Promise<ClassYear> {
    const saved = await this.classYearRepository.save(classYear);
    
    // Update cache
    await this.cacheManager.del(`class-year:id:${saved.id}`);
    await this.cacheManager.del(`class-year:${saved.classId}:${saved.academicYearId}`);
    await this.cacheManager.set(`class-year:id:${saved.id}`, saved);
    await this.cacheManager.set(`class-year:${saved.classId}:${saved.academicYearId}`, saved);
    
    // Invalidate list caches
    await CacheUtil.deletePattern(this.cacheManager, `class-year:academic-year:${saved.academicYearId}`);
    await CacheUtil.deletePattern(this.cacheManager, `class-year:class:${saved.classId}`);
    
    return saved;
  }

  async delete(id: string): Promise<void> {
    const classYear = await this.findById(id);
    if (classYear) {
      await this.classYearRepository.delete(id);
      
      // Delete entity caches
      await this.cacheManager.del(`class-year:id:${id}`);
      await this.cacheManager.del(`class-year:${classYear.classId}:${classYear.academicYearId}`);
      
      // Invalidate list caches
      await CacheUtil.deletePattern(this.cacheManager, `class-year:academic-year:${classYear.academicYearId}`);
      await CacheUtil.deletePattern(this.cacheManager, `class-year:class:${classYear.classId}`);
    }
  }
}
