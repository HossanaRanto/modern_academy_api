import { StudentInscription } from '../../../../entities/student-inscription.entity';

export interface IStudentInscriptionRepository {
  findByStudentAndAcademicYear(
    studentId: string,
    academicYearId: string,
  ): Promise<StudentInscription | null>;
  findStudentClassYear(
    studentId: string,
    academicYearId: string,
  ): Promise<string | null>;
  isStudentEnrolledInCourse(
    studentId: string,
    courseId: string,
    academicYearId: string,
  ): Promise<boolean>;
}

export const STUDENT_INSCRIPTION_REPOSITORY = Symbol(
  'STUDENT_INSCRIPTION_REPOSITORY',
);
