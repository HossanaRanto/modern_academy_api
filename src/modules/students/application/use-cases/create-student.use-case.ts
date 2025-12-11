import { Inject, Injectable } from '@nestjs/common';
import * as StudentPort from '../ports/student-repository.port';
import { CreateStudentRequest, StudentResponse } from '../../domain/student.interface';

@Injectable()
export class CreateStudentUseCase {
  constructor(
    @Inject(StudentPort.STUDENT_REPOSITORY)
    private readonly studentRepository: StudentPort.IStudentRepository,
  ) {}

  async execute(request: CreateStudentRequest, tenantId: string): Promise<StudentResponse> {
    const student = await this.studentRepository.create(
      {
        firstName: request.firstName,
        lastName: request.lastName,
        email: request.email,
        phone: request.phone,
        dateOfBirth: request.dateOfBirth,
        address: request.address,
        isActive: true,
      },
      tenantId,
    );

    return this.mapToResponse(student);
  }

  private mapToResponse(student: any): StudentResponse {
    return {
      id: student.id,
      firstName: student.firstName,
      lastName: student.lastName,
      email: student.email,
      phone: student.phone,
      dateOfBirth: student.dateOfBirth,
      address: student.address,
      isActive: student.isActive,
      createdAt: student.createdAt,
      updatedAt: student.updatedAt,
      inscriptions: student.inscriptions?.map((i: any) => ({
        id: i.id,
        academicYearId: i.academicYearId,
        status: i.status,
      })),
    };
  }
}
