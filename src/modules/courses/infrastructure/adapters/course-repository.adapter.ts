import { Injectable, Inject } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { CACHE_MANAGER } from '@nestjs/cache-manager';
import type * as CacheManagerTypes from 'cache-manager';
import { Course } from '../../../../entities/course.entity';
import { ICourseRepository } from '../../application/ports/course-repository.port';

@Injectable()
export class CourseRepositoryAdapter implements ICourseRepository {
  constructor(
    @InjectRepository(Course)
    private readonly courseRepository: Repository<Course>,
    @Inject(CACHE_MANAGER)
    private readonly cacheManager: CacheManagerTypes.Cache,
  ) {}

  async findByCode(code: string): Promise<Course | null> {
    const cacheKey = `course:code:${code}`;
    
    const cached = await this.cacheManager.get<Course>(cacheKey);
    if (cached) {
      return cached;
    }

    const course = await this.courseRepository.findOne({ where: { code } });
    
    if (course) {
      await this.cacheManager.set(cacheKey, course);
    }
    
    return course;
  }

  async findById(id: string): Promise<Course | null> {
    const cacheKey = `course:id:${id}`;
    
    const cached = await this.cacheManager.get<Course>(cacheKey);
    if (cached) {
      return cached;
    }

    const course = await this.courseRepository.findOne({ where: { id } });
    
    if (course) {
      await this.cacheManager.set(cacheKey, course);
    }
    
    return course;
  }

  async findAll(academyId: string): Promise<Course[]> {
    const cacheKey = `course:all:${academyId}`;
    
    const cached = await this.cacheManager.get<Course[]>(cacheKey);
    if (cached) {
      return cached;
    }

    const courses = await this.courseRepository.find({
      order: { name: 'ASC' },
    });
    
    await this.cacheManager.set(cacheKey, courses);
    
    return courses;
  }

  async findAllActive(academyId: string): Promise<Course[]> {
    const cacheKey = `course:active:${academyId}`;
    
    const cached = await this.cacheManager.get<Course[]>(cacheKey);
    if (cached) {
      return cached;
    }

    const courses = await this.courseRepository.find({
      where: { isActive: true },
      order: { name: 'ASC' },
    });
    
    await this.cacheManager.set(cacheKey, courses);
    
    return courses;
  }

  async findByCategory(category: string, academyId: string): Promise<Course[]> {
    const cacheKey = `course:category:${category}:${academyId}`;
    
    const cached = await this.cacheManager.get<Course[]>(cacheKey);
    if (cached) {
      return cached;
    }

    const courses = await this.courseRepository.find({
      where: { category },
      order: { name: 'ASC' },
    });
    
    await this.cacheManager.set(cacheKey, courses);
    
    return courses;
  }

  async create(courseData: Partial<Course>): Promise<Course> {
    const course = this.courseRepository.create(courseData);
    const saved = await this.courseRepository.save(course);
    
    await this.cacheManager.set(`course:id:${saved.id}`, saved);
    await this.cacheManager.set(`course:code:${saved.code}`, saved);
    
    // Invalidate list caches
    await this.cacheManager.del('course:all:*');
    await this.cacheManager.del('course:active:*');
    if (saved.category) {
      await this.cacheManager.del(`course:category:${saved.category}:*`);
    }
    
    return saved;
  }

  async save(course: Course): Promise<Course> {
    const saved = await this.courseRepository.save(course);
    
    await this.cacheManager.del(`course:id:${saved.id}`);
    await this.cacheManager.del(`course:code:${saved.code}`);
    await this.cacheManager.set(`course:id:${saved.id}`, saved);
    await this.cacheManager.set(`course:code:${saved.code}`, saved);
    
    // Invalidate list caches
    await this.cacheManager.del('course:all:*');
    await this.cacheManager.del('course:active:*');
    if (saved.category) {
      await this.cacheManager.del(`course:category:${saved.category}:*`);
    }
    
    return saved;
  }

  async delete(id: string): Promise<void> {
    const course = await this.findById(id);
    if (course) {
      await this.courseRepository.delete(id);
      
      await this.cacheManager.del(`course:id:${id}`);
      await this.cacheManager.del(`course:code:${course.code}`);
      await this.cacheManager.del('course:all:*');
      await this.cacheManager.del('course:active:*');
      if (course.category) {
        await this.cacheManager.del(`course:category:${course.category}:*`);
      }
    }
  }
}
