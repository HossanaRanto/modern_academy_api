import { Injectable, NotFoundException, Inject } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { CACHE_MANAGER } from '@nestjs/cache-manager';
import type * as CacheManagerTypes from 'cache-manager';
import { Student } from '../../../../entities/student.entity';
import { IStudentRepository } from '../../application/ports/student-repository.port';

@Injectable()
export class StudentRepositoryAdapter implements IStudentRepository {
  constructor(
    @InjectRepository(Student)
    private readonly studentRepository: Repository<Student>,
    @Inject(CACHE_MANAGER)
    private readonly cacheManager: CacheManagerTypes.Cache,
  ) {}

  async findById(id: string, tenantId: string): Promise<Student | null> {
    const cacheKey = `student:id:${id}:tenant:${tenantId}`;
    
    // Try cache first
    const cached = await this.cacheManager.get<Student>(cacheKey);
    if (cached) {
      return cached;
    }
    
    // Find student with inscriptions that belong to the academy
    const student = await this.studentRepository
      .createQueryBuilder('student')
      .leftJoinAndSelect('student.inscriptions', 'inscription')
      .leftJoinAndSelect('inscription.academicYear', 'academicYear')
      .where('student.id = :id', { id })
      .andWhere('academicYear.academyId = :tenantId', { tenantId })
      .getOne();

    // Cache if found
    if (student) {
      await this.cacheManager.set(cacheKey, student);
    }

    return student;
  }

  async findAll(tenantId: string): Promise<Student[]> {
    const cacheKey = `students:tenant:${tenantId}`;
    
    // Try cache first
    const cached = await this.cacheManager.get<Student[]>(cacheKey);
    if (cached) {
      return cached;
    }
    
    // Find all students who have inscriptions in this academy
    const students = await this.studentRepository
      .createQueryBuilder('student')
      .leftJoinAndSelect('student.inscriptions', 'inscription')
      .leftJoinAndSelect('inscription.academicYear', 'academicYear')
      .where('academicYear.academyId = :tenantId', { tenantId })
      .orderBy('student.createdAt', 'DESC')
      .getMany();

    // Cache the list
    await this.cacheManager.set(cacheKey, students);

    return students;
  }

  async create(studentData: Partial<Student>, tenantId: string): Promise<Student> {
    // Create student without academyId since it's linked through inscription
    const student = this.studentRepository.create(studentData);
    const saved = await this.studentRepository.save(student);
    
    // Invalidate list cache
    await this.cacheManager.del(`students:tenant:${tenantId}`);
    
    // Note: After creating a student, you'll need to create a StudentInscription
    // to link them to an AcademicYear (and thus to the Academy)
    return Array.isArray(saved) ? saved[0] : saved;
  }

  async update(
    id: string,
    studentData: Partial<Student>,
    tenantId: string,
  ): Promise<Student> {
    const student = await this.findById(id, tenantId);
    
    if (!student) {
      throw new NotFoundException('Student not found');
    }

    Object.assign(student, studentData);
    const updated = await this.studentRepository.save(student);
    
    // Invalidate caches
    await this.cacheManager.del(`student:id:${id}:tenant:${tenantId}`);
    await this.cacheManager.del(`students:tenant:${tenantId}`);
    
    return updated;
  }

  async delete(id: string, tenantId: string): Promise<void> {
    const student = await this.findById(id, tenantId);
    
    if (!student) {
      throw new NotFoundException('Student not found');
    }

    await this.studentRepository.remove(student);
    
    // Invalidate caches
    await this.cacheManager.del(`student:id:${id}:tenant:${tenantId}`);
    await this.cacheManager.del(`students:tenant:${tenantId}`);
  }
}
