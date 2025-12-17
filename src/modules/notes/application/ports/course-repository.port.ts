export interface ICourseRepository {
  findByCode(code: string): Promise<any | null>;
}

export const COURSE_REPOSITORY = Symbol('COURSE_REPOSITORY');
