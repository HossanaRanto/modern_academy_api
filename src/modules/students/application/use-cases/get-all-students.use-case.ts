import { Inject, Injectable } from '@nestjs/common';
import * as StudentPort from '../ports/student-repository.port';
import { StudentResponse } from '../../domain/student.interface';

@Injectable()
export class GetAllStudentsUseCase {
  constructor(
    @Inject(StudentPort.STUDENT_REPOSITORY)
    private readonly studentRepository: StudentPort.IStudentRepository,
  ) {}

  async execute(tenantId: string): Promise<StudentResponse[]> {
    const students = await this.studentRepository.findAll(tenantId);
    return students.map((student) => this.mapToResponse(student));
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
