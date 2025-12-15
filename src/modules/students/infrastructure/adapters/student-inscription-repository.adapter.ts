import { Injectable, Inject } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { CACHE_MANAGER } from '@nestjs/cache-manager';
import type * as CacheManagerTypes from 'cache-manager';
import { StudentInscription } from '../../../../entities/student-inscription.entity';
import { IStudentInscriptionRepository } from '../../application/ports/student-inscription-repository.port';
import { CacheUtil } from '../../../../shared/utils/cache.util';

@Injectable()
export class StudentInscriptionRepositoryAdapter implements IStudentInscriptionRepository {
  constructor(
    @InjectRepository(StudentInscription)
    private readonly inscriptionRepository: Repository<StudentInscription>,
    @Inject(CACHE_MANAGER)
    private readonly cacheManager: CacheManagerTypes.Cache,
  ) {}

  async findById(id: string): Promise<StudentInscription | null> {
    const cacheKey = `student-inscription:id:${id}`;
    
    const cached = await this.cacheManager.get<StudentInscription>(cacheKey);
    if (cached) {
      return cached;
    }

    const inscription = await this.inscriptionRepository.findOne({ 
      where: { id },
      relations: ['student', 'academicYear', 'classYear', 'classYear.class'],
    });
    
    if (inscription) {
      await this.cacheManager.set(cacheKey, inscription);
    }
    
    return inscription;
  }

  async findByStudentAndAcademicYear(
    studentId: string,
    academicYearId: string,
  ): Promise<StudentInscription | null> {
    const cacheKey = `student-inscription:${studentId}:${academicYearId}`;
    
    const cached = await this.cacheManager.get<StudentInscription>(cacheKey);
    if (cached) {
      return cached;
    }

    const inscription = await this.inscriptionRepository.findOne({
      where: { studentId, academicYearId },
      relations: ['student', 'academicYear', 'classYear', 'classYear.class'],
    });
    
    if (inscription) {
      await this.cacheManager.set(cacheKey, inscription);
    }
    
    return inscription;
  }

  async findByAcademicYear(academicYearId: string): Promise<StudentInscription[]> {
    const cacheKey = `student-inscription:academic-year:${academicYearId}`;
    
    const cached = await this.cacheManager.get<StudentInscription[]>(cacheKey);
    if (cached) {
      return cached;
    }

    const inscriptions = await this.inscriptionRepository.find({
      where: { academicYearId },
      relations: ['student', 'classYear', 'classYear.class'],
      order: { 
        classYear: { class: { level: 'ASC' } },
        student: { lastName: 'ASC', firstName: 'ASC' } 
      },
    });
    
    await this.cacheManager.set(cacheKey, inscriptions);
    
    return inscriptions;
  }

  async findByClassYear(classYearId: string): Promise<StudentInscription[]> {
    const cacheKey = `student-inscription:class-year:${classYearId}`;
    
    const cached = await this.cacheManager.get<StudentInscription[]>(cacheKey);
    if (cached) {
      return cached;
    }

    const inscriptions = await this.inscriptionRepository.find({
      where: { classYearId },
      relations: ['student'],
      order: { student: { lastName: 'ASC', firstName: 'ASC' } },
    });
    
    await this.cacheManager.set(cacheKey, inscriptions);
    
    return inscriptions;
  }

  async findByStudent(studentId: string): Promise<StudentInscription[]> {
    const cacheKey = `student-inscription:student:${studentId}`;
    
    const cached = await this.cacheManager.get<StudentInscription[]>(cacheKey);
    if (cached) {
      return cached;
    }

    const inscriptions = await this.inscriptionRepository.find({
      where: { studentId },
      relations: ['academicYear', 'classYear', 'classYear.class'],
      order: { academicYear: { startDate: 'DESC' } },
    });
    
    await this.cacheManager.set(cacheKey, inscriptions);
    
    return inscriptions;
  }

  async create(inscriptionData: Partial<StudentInscription>): Promise<StudentInscription> {
    const inscription = this.inscriptionRepository.create(inscriptionData);
    const saved = await this.inscriptionRepository.save(inscription);
    
    // Cache the new entity
    await this.cacheManager.set(`student-inscription:id:${saved.id}`, saved);
    await this.cacheManager.set(
      `student-inscription:${saved.studentId}:${saved.academicYearId}`,
      saved,
    );
    
    // Invalidate list caches
    await CacheUtil.deletePattern(
      this.cacheManager,
      `student-inscription:academic-year:${saved.academicYearId}`,
    );
    await CacheUtil.deletePattern(
      this.cacheManager,
      `student-inscription:class-year:${saved.classYearId}`,
    );
    await CacheUtil.deletePattern(
      this.cacheManager,
      `student-inscription:student:${saved.studentId}`,
    );
    
    // Invalidate student caches
    await this.cacheManager.del(`student:id:${saved.studentId}`);
    await CacheUtil.deletePattern(
      this.cacheManager,
      `student:academic-year:${saved.academicYearId}`,
    );
    
    return saved;
  }

  async save(inscription: StudentInscription): Promise<StudentInscription> {
    const saved = await this.inscriptionRepository.save(inscription);
    
    // Update cache
    await this.cacheManager.del(`student-inscription:id:${saved.id}`);
    await this.cacheManager.del(
      `student-inscription:${saved.studentId}:${saved.academicYearId}`,
    );
    await this.cacheManager.set(`student-inscription:id:${saved.id}`, saved);
    await this.cacheManager.set(
      `student-inscription:${saved.studentId}:${saved.academicYearId}`,
      saved,
    );
    
    // Invalidate list caches
    await CacheUtil.deletePattern(
      this.cacheManager,
      `student-inscription:academic-year:${saved.academicYearId}`,
    );
    await CacheUtil.deletePattern(
      this.cacheManager,
      `student-inscription:class-year:${saved.classYearId}`,
    );
    await CacheUtil.deletePattern(
      this.cacheManager,
      `student-inscription:student:${saved.studentId}`,
    );
    
    return saved;
  }

  async delete(id: string): Promise<void> {
    const inscription = await this.findById(id);
    if (inscription) {
      await this.inscriptionRepository.delete(id);
      
      // Delete entity caches
      await this.cacheManager.del(`student-inscription:id:${id}`);
      await this.cacheManager.del(
        `student-inscription:${inscription.studentId}:${inscription.academicYearId}`,
      );
      
      // Invalidate list caches
      await CacheUtil.deletePattern(
        this.cacheManager,
        `student-inscription:academic-year:${inscription.academicYearId}`,
      );
      await CacheUtil.deletePattern(
        this.cacheManager,
        `student-inscription:class-year:${inscription.classYearId}`,
      );
      await CacheUtil.deletePattern(
        this.cacheManager,
        `student-inscription:student:${inscription.studentId}`,
      );
      
      // Invalidate student caches
      await this.cacheManager.del(`student:id:${inscription.studentId}`);
      await CacheUtil.deletePattern(
        this.cacheManager,
        `student:academic-year:${inscription.academicYearId}`,
      );
    }
  }
}
