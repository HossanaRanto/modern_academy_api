import { Injectable, NotFoundException } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { Student } from '../../../../entities/student.entity';
import { IStudentRepository } from '../../application/ports/student-repository.port';

@Injectable()
export class StudentRepositoryAdapter implements IStudentRepository {
  constructor(
    @InjectRepository(Student)
    private readonly studentRepository: Repository<Student>,
  ) {}

  async findById(id: string, tenantId: string): Promise<Student | null> {
    // Find student with inscriptions that belong to the academy
    const student = await this.studentRepository
      .createQueryBuilder('student')
      .leftJoinAndSelect('student.inscriptions', 'inscription')
      .leftJoinAndSelect('inscription.academicYear', 'academicYear')
      .where('student.id = :id', { id })
      .andWhere('academicYear.academyId = :tenantId', { tenantId })
      .getOne();

    return student;
  }

  async findAll(tenantId: string): Promise<Student[]> {
    // Find all students who have inscriptions in this academy
    const students = await this.studentRepository
      .createQueryBuilder('student')
      .leftJoinAndSelect('student.inscriptions', 'inscription')
      .leftJoinAndSelect('inscription.academicYear', 'academicYear')
      .where('academicYear.academyId = :tenantId', { tenantId })
      .orderBy('student.createdAt', 'DESC')
      .getMany();

    return students;
  }

  async create(studentData: Partial<Student>, tenantId: string): Promise<Student> {
    // Create student without academyId since it's linked through inscription
    const student = this.studentRepository.create(studentData);
    const saved = await this.studentRepository.save(student);
    
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
    return this.studentRepository.save(student);
  }

  async delete(id: string, tenantId: string): Promise<void> {
    const student = await this.findById(id, tenantId);
    
    if (!student) {
      throw new NotFoundException('Student not found');
    }

    await this.studentRepository.remove(student);
  }
}
