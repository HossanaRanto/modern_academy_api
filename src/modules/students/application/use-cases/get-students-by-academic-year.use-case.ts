import { Injectable, Inject } from '@nestjs/common';
import * as StudentPort from '../ports/student-repository.port';
import { StudentResponse } from '../../domain/student.interface';

@Injectable()
export class GetStudentsByAcademicYearUseCase {
  constructor(
    @Inject(StudentPort.STUDENT_REPOSITORY)
    private readonly studentRepository: StudentPort.IStudentRepository,
  ) {}

  async execute(academicYearId: string): Promise<StudentResponse[]> {
    const students = await this.studentRepository.findByAcademicYear(academicYearId);
    
    return students.map(student => {
      // Get the current class from the inscription for this academic year
      const inscription = student.inscriptions?.[0];
      const classYear = inscription?.classYear;
      const classEntity = classYear?.class;
      
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
        currentClass: classEntity ? {
          id: classEntity.id,
          code: classEntity.code,
          name: classEntity.name,
          level: classEntity.level,
        } : undefined,
        createdAt: student.createdAt,
        updatedAt: student.updatedAt,
      };
    });
  }
}
