import { Student } from '../../../../entities/student.entity';

export interface IStudentRepository {
  findById(id: string): Promise<Student | null>;
  findByRegistrationNumber(registrationNumber: string): Promise<Student | null>;
  findAll(): Promise<Student[]>;
  findByAcademicYear(academicYearId: string): Promise<Student[]>;
  create(studentData: Partial<Student>): Promise<Student>;
  save(student: Student): Promise<Student>;
  delete(id: string): Promise<void>;
}

export const STUDENT_REPOSITORY = Symbol('STUDENT_REPOSITORY');

