export interface IStudentRepository {
  findByRegistrationNumber(registrationNumber: string): Promise<any | null>;
}

export const STUDENT_REPOSITORY = Symbol('STUDENT_REPOSITORY');
