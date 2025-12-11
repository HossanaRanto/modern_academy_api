import { Student } from '../../../../entities/student.entity';

export interface IStudentRepository {
  findById(id: string, tenantId: string): Promise<Student | null>;
  findAll(tenantId: string): Promise<Student[]>;
  create(studentData: Partial<Student>, tenantId: string): Promise<Student>;
  update(id: string, studentData: Partial<Student>, tenantId: string): Promise<Student>;
  delete(id: string, tenantId: string): Promise<void>;
}

export const STUDENT_REPOSITORY = Symbol('STUDENT_REPOSITORY');
