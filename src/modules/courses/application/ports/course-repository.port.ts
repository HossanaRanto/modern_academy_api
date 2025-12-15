import { Course } from '../../../../entities/course.entity';

export interface ICourseRepository {
  findByCode(code: string): Promise<Course | null>;
  findById(id: string): Promise<Course | null>;
  findAll(academyId: string): Promise<Course[]>;
  findAllActive(academyId: string): Promise<Course[]>;
  findByCategory(category: string, academyId: string): Promise<Course[]>;
  create(courseData: Partial<Course>): Promise<Course>;
  save(course: Course): Promise<Course>;
  delete(id: string): Promise<void>;
}

export const COURSE_REPOSITORY = Symbol('COURSE_REPOSITORY');
