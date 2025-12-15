import { Injectable, Inject } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { CACHE_MANAGER } from '@nestjs/cache-manager';
import type * as CacheManagerTypes from 'cache-manager';
import { CourseClass } from '../../../../entities/course-class.entity';
import { ICourseClassRepository } from '../../application/ports/course-class-repository.port';

@Injectable()
export class CourseClassRepositoryAdapter implements ICourseClassRepository {
  constructor(
    @InjectRepository(CourseClass)
    private readonly courseClassRepository: Repository<CourseClass>,
    @Inject(CACHE_MANAGER)
    private readonly cacheManager: CacheManagerTypes.Cache,
  ) {}

  async findById(id: string): Promise<CourseClass | null> {
    const cacheKey = `course-class:id:${id}`;
    
    const cached = await this.cacheManager.get<CourseClass>(cacheKey);
    if (cached) {
      return cached;
    }

    const courseClass = await this.courseClassRepository.findOne({ 
      where: { id },
      relations: ['course', 'classYear'],
    });
    
    if (courseClass) {
      await this.cacheManager.set(cacheKey, courseClass);
    }
    
    return courseClass;
  }

  async findByCourseAndClassYear(courseId: string, classYearId: string): Promise<CourseClass | null> {
    const cacheKey = `course-class:${courseId}:${classYearId}`;
    
    const cached = await this.cacheManager.get<CourseClass>(cacheKey);
    if (cached) {
      return cached;
    }

    const courseClass = await this.courseClassRepository.findOne({
      where: { courseId, classYearId },
      relations: ['course', 'classYear'],
    });
    
    if (courseClass) {
      await this.cacheManager.set(cacheKey, courseClass);
    }
    
    return courseClass;
  }

  async findByClassYear(classYearId: string): Promise<CourseClass[]> {
    const cacheKey = `course-class:class-year:${classYearId}`;
    
    const cached = await this.cacheManager.get<CourseClass[]>(cacheKey);
    if (cached) {
      return cached;
    }

    const courseClasses = await this.courseClassRepository.find({
      where: { classYearId },
      relations: ['course'],
      order: { course: { name: 'ASC' } },
    });
    
    await this.cacheManager.set(cacheKey, courseClasses);
    
    return courseClasses;
  }

  async findByCourse(courseId: string): Promise<CourseClass[]> {
    const cacheKey = `course-class:course:${courseId}`;
    
    const cached = await this.cacheManager.get<CourseClass[]>(cacheKey);
    if (cached) {
      return cached;
    }

    const courseClasses = await this.courseClassRepository.find({
      where: { courseId },
      relations: ['classYear'],
    });
    
    await this.cacheManager.set(cacheKey, courseClasses);
    
    return courseClasses;
  }

  async create(courseClassData: Partial<CourseClass>): Promise<CourseClass> {
    const courseClass = this.courseClassRepository.create(courseClassData);
    const saved = await this.courseClassRepository.save(courseClass);
    
    await this.cacheManager.set(`course-class:id:${saved.id}`, saved);
    await this.cacheManager.set(`course-class:${saved.courseId}:${saved.classYearId}`, saved);
    
    // Invalidate list caches
    await this.cacheManager.del(`course-class:class-year:${saved.classYearId}`);
    await this.cacheManager.del(`course-class:course:${saved.courseId}`);
    
    return saved;
  }

  async save(courseClass: CourseClass): Promise<CourseClass> {
    const saved = await this.courseClassRepository.save(courseClass);
    
    await this.cacheManager.del(`course-class:id:${saved.id}`);
    await this.cacheManager.del(`course-class:${saved.courseId}:${saved.classYearId}`);
    await this.cacheManager.set(`course-class:id:${saved.id}`, saved);
    await this.cacheManager.set(`course-class:${saved.courseId}:${saved.classYearId}`, saved);
    
    // Invalidate list caches
    await this.cacheManager.del(`course-class:class-year:${saved.classYearId}`);
    await this.cacheManager.del(`course-class:course:${saved.courseId}`);
    
    return saved;
  }

  async delete(id: string): Promise<void> {
    const courseClass = await this.findById(id);
    if (courseClass) {
      await this.courseClassRepository.delete(id);
      
      await this.cacheManager.del(`course-class:id:${id}`);
      await this.cacheManager.del(`course-class:${courseClass.courseId}:${courseClass.classYearId}`);
      await this.cacheManager.del(`course-class:class-year:${courseClass.classYearId}`);
      await this.cacheManager.del(`course-class:course:${courseClass.courseId}`);
    }
  }
}
