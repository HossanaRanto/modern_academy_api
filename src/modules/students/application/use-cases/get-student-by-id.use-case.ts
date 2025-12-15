import { Injectable, Inject, NotFoundException } from '@nestjs/common';
import * as StudentPort from '../ports/student-repository.port';
import { StudentResponse } from '../../domain/student.interface';

@Injectable()
export class GetStudentByIdUseCase {
  constructor(
    @Inject(StudentPort.STUDENT_REPOSITORY)
    private readonly studentRepository: StudentPort.IStudentRepository,
  ) {}

  async execute(id: string): Promise<StudentResponse> {
    const student = await this.studentRepository.findById(id);
    
    if (!student) {
      throw new NotFoundException('Student not found');
    }
    
    return {
      id: student.id,
      firstName: student.firstName,
      lastName: student.lastName,
      registrationNumber: student.registrationNumber,
      dateOfBirth: student.dateOfBirth,
      placeOfBirth: student.placeOfBirth,
      gender: student.gender,
      photo: student.photo,
      address: student.address,
      phone: student.phone,
      email: student.email,
      parentName: student.parentName,
      parentPhone: student.parentPhone,
      parentEmail: student.parentEmail,
      isActive: student.isActive,
      createdAt: student.createdAt,
      updatedAt: student.updatedAt,
    };
  }
}
