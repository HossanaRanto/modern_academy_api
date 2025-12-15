import { StudentInscription } from '../../../../entities/student-inscription.entity';

export interface IStudentInscriptionRepository {
  findById(id: string): Promise<StudentInscription | null>;
  findByStudentAndAcademicYear(studentId: string, academicYearId: string): Promise<StudentInscription | null>;
  findByAcademicYear(academicYearId: string): Promise<StudentInscription[]>;
  findByClassYear(classYearId: string): Promise<StudentInscription[]>;
  findByStudent(studentId: string): Promise<StudentInscription[]>;
  create(inscriptionData: Partial<StudentInscription>): Promise<StudentInscription>;
  save(inscription: StudentInscription): Promise<StudentInscription>;
  delete(id: string): Promise<void>;
}

export const STUDENT_INSCRIPTION_REPOSITORY = Symbol('STUDENT_INSCRIPTION_REPOSITORY');
