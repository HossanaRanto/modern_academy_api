import { Injectable, Inject } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { CACHE_MANAGER } from '@nestjs/cache-manager';
import type * as CacheManagerTypes from 'cache-manager';
import { Student } from '../../../../entities/student.entity';
import { IStudentRepository } from '../../application/ports/student-repository.port';
import { CacheUtil } from '../../../../shared/utils/cache.util';

@Injectable()
export class StudentRepositoryAdapter implements IStudentRepository {
  constructor(
    @InjectRepository(Student)
    private readonly studentRepository: Repository<Student>,
    @Inject(CACHE_MANAGER)
    private readonly cacheManager: CacheManagerTypes.Cache,
  ) {}

  async findById(id: string): Promise<Student | null> {
    const cacheKey = `student:id:${id}`;
    
    const cached = await this.cacheManager.get<Student>(cacheKey);
    if (cached) {
      return cached;
    }

    const student = await this.studentRepository.findOne({ where: { id } });
    
    if (student) {
      await this.cacheManager.set(cacheKey, student);
    }
    
    return student;
  }

  async findByRegistrationNumber(registrationNumber: string): Promise<Student | null> {
    const cacheKey = `student:registration:${registrationNumber}`;
    
    const cached = await this.cacheManager.get<Student>(cacheKey);
    if (cached) {
      return cached;
    }

    const student = await this.studentRepository.findOne({ 
      where: { registrationNumber } 
    });
    
    if (student) {
      await this.cacheManager.set(cacheKey, student);
    }
    
    return student;
  }

  async findAll(): Promise<Student[]> {
    const cacheKey = 'student:all';
    
    const cached = await this.cacheManager.get<Student[]>(cacheKey);
    if (cached) {
      return cached;
    }

    const students = await this.studentRepository.find({
      order: { createdAt: 'DESC' },
    });
    
    await this.cacheManager.set(cacheKey, students);
    
    return students;
  }

  async findByAcademicYear(academicYearId: string): Promise<Student[]> {
    const cacheKey = `student:academic-year:${academicYearId}`;
    
    const cached = await this.cacheManager.get<Student[]>(cacheKey);
    if (cached) {
      return cached;
    }

    const students = await this.studentRepository
      .createQueryBuilder('student')
      .innerJoin('student.inscriptions', 'inscription')
      .leftJoinAndSelect('inscription.classYear', 'classYear')
      .leftJoinAndSelect('classYear.class', 'class')
      .where('inscription.academicYearId = :academicYearId', { academicYearId })
      .orderBy('student.lastName', 'ASC')
      .addOrderBy('student.firstName', 'ASC')
      .getMany();
    
    await this.cacheManager.set(cacheKey, students);
    
    return students;
  }

  async create(studentData: Partial<Student>): Promise<Student> {
    const student = this.studentRepository.create(studentData);
    const saved = await this.studentRepository.save(student);
    
    // Cache the new entity
    await this.cacheManager.set(`student:id:${saved.id}`, saved);
    await this.cacheManager.set(`student:registration:${saved.registrationNumber}`, saved);
    
    // Invalidate list caches
    await CacheUtil.deletePattern(this.cacheManager, 'student:all');
    await CacheUtil.deletePattern(this.cacheManager, 'student:academic-year:*');
    
    return saved;
  }

  async save(student: Student): Promise<Student> {
    const saved = await this.studentRepository.save(student);
    
    // Update cache
    await this.cacheManager.del(`student:id:${saved.id}`);
    await this.cacheManager.del(`student:registration:${saved.registrationNumber}`);
    await this.cacheManager.set(`student:id:${saved.id}`, saved);
    await this.cacheManager.set(`student:registration:${saved.registrationNumber}`, saved);
    
    // Invalidate list caches
    await CacheUtil.deletePattern(this.cacheManager, 'student:all');
    await CacheUtil.deletePattern(this.cacheManager, 'student:academic-year:*');
    
    return saved;
  }

  async delete(id: string): Promise<void> {
    const student = await this.findById(id);
    if (student) {
      await this.studentRepository.delete(id);
      
      // Delete entity caches
      await this.cacheManager.del(`student:id:${id}`);
      await this.cacheManager.del(`student:registration:${student.registrationNumber}`);
      
      // Invalidate list caches
      await CacheUtil.deletePattern(this.cacheManager, 'student:all');
      await CacheUtil.deletePattern(this.cacheManager, 'student:academic-year:*');
    }
  }
}

