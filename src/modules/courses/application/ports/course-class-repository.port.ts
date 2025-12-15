import { CourseClass } from '../../../../entities/course-class.entity';

export interface ICourseClassRepository {
  findById(id: string): Promise<CourseClass | null>;
  findByCourseAndClassYear(courseId: string, classYearId: string): Promise<CourseClass | null>;
  findByClassYear(classYearId: string): Promise<CourseClass[]>;
  findByCourse(courseId: string): Promise<CourseClass[]>;
  create(courseClassData: Partial<CourseClass>): Promise<CourseClass>;
  save(courseClass: CourseClass): Promise<CourseClass>;
  delete(id: string): Promise<void>;
}

export const COURSE_CLASS_REPOSITORY = Symbol('COURSE_CLASS_REPOSITORY');
