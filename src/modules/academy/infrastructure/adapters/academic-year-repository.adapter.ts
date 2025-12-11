import { Injectable, Inject } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { CACHE_MANAGER } from '@nestjs/cache-manager';
import type * as CacheManagerTypes from 'cache-manager';
import { AcademicYear } from '../../../../entities/academic-year.entity';
import { IAcademicYearRepository } from '../../application/ports/academic-year-repository.port';

@Injectable()
export class AcademicYearRepositoryAdapter implements IAcademicYearRepository {
  constructor(
    @InjectRepository(AcademicYear)
    private readonly academicYearRepository: Repository<AcademicYear>,
    @Inject(CACHE_MANAGER)
    private readonly cacheManager: CacheManagerTypes.Cache,
  ) {}

  async create(academicYear: Partial<AcademicYear>): Promise<AcademicYear> {
    const newAcademicYear = this.academicYearRepository.create(academicYear);
    const saved = await this.academicYearRepository.save(newAcademicYear);
    
    // Invalidate list cache for this academy
    await this.cacheManager.del(`academic-years:academy:${saved.academyId}`);
    await this.cacheManager.del(`academic-year:current:${saved.academyId}`);
    
    // Cache the new academic year
    await this.cacheManager.set(`academic-year:id:${saved.id}`, saved);
    
    return saved;
  }

  async findById(id: string): Promise<AcademicYear | null> {
    const cacheKey = `academic-year:id:${id}`;
    
    // Try cache first
    const cached = await this.cacheManager.get<AcademicYear>(cacheKey);
    if (cached) {
      return cached;
    }
    
    const academicYear = await this.academicYearRepository.findOne({ 
      where: { id },
    });
    
    // Cache if found
    if (academicYear) {
      await this.cacheManager.set(cacheKey, academicYear);
    }
    
    return academicYear;
  }

  async findByAcademyId(academyId: string): Promise<AcademicYear[]> {
    console.log("test ",academyId);
    
    const cacheKey = `academic-years:academy:${academyId}`;
    
    // Try cache first
    const cached = await this.cacheManager.get<AcademicYear[]>(cacheKey);
    if (cached) {
      return cached;
    }
    
    const academicYears = await this.academicYearRepository.find({
      where: {
        academyId: academyId
       },
      order: { startDate: 'DESC' },
    });
    
    // Cache the list
    await this.cacheManager.set(cacheKey, academicYears);
    
    return academicYears;
  }

  async findCurrentByAcademyId(academyId: string): Promise<AcademicYear | null> {
    const cacheKey = `academic-year:current:${academyId}`;
    
    // Try cache first
    const cached = await this.cacheManager.get<AcademicYear>(cacheKey);
    if (cached) {
      return cached;
    }
    
    const academicYear = await this.academicYearRepository.findOne({
      where: { 
        academyId,
        isCurrent: true,
      },
    });
    
    // Cache if found
    if (academicYear) {
      await this.cacheManager.set(cacheKey, academicYear);
    }
    
    return academicYear;
  }

  async update(id: string, academicYear: Partial<AcademicYear>): Promise<AcademicYear> {
    await this.academicYearRepository.update(id, academicYear);
    const updated = await this.findById(id);
    if (!updated) {
      throw new Error('Academic year not found after update');
    }
    
    // Invalidate caches
    await this.cacheManager.del(`academic-year:id:${id}`);
    await this.cacheManager.del(`academic-years:academy:${updated.academyId}`);
    await this.cacheManager.del(`academic-year:current:${updated.academyId}`);
    
    // Update cache
    await this.cacheManager.set(`academic-year:id:${id}`, updated);
    
    return updated;
  }

  async setAsCurrent(id: string, academyId: string): Promise<AcademicYear> {
    // Set all academic years to not current
    await this.academicYearRepository.update(
      { academyId },
      { isCurrent: false },
    );

    // Set the specified one as current
    await this.academicYearRepository.update(id, { isCurrent: true });

    const updated = await this.findById(id);
    if (!updated) {
      throw new Error('Academic year not found after update');
    }
    
    // Invalidate all related caches
    await this.cacheManager.del(`academic-year:id:${id}`);
    await this.cacheManager.del(`academic-years:academy:${academyId}`);
    await this.cacheManager.del(`academic-year:current:${academyId}`);
    
    // Update caches
    await this.cacheManager.set(`academic-year:id:${id}`, updated);
    await this.cacheManager.set(`academic-year:current:${academyId}`, updated);
    
    return updated;
  }
}
