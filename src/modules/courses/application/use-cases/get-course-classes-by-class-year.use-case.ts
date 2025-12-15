import { Inject, Injectable } from '@nestjs/common';
import * as CourseClassPort from '../ports/course-class-repository.port';
import { CourseClassResponse } from '../../domain/course.interface';

@Injectable()
export class GetCourseClassesByClassYearUseCase {
  constructor(
    @Inject(CourseClassPort.COURSE_CLASS_REPOSITORY)
    private readonly courseClassRepository: CourseClassPort.ICourseClassRepository,
  ) {}

  async execute(classYearId: string): Promise<CourseClassResponse[]> {
    const courseClasses = await this.courseClassRepository.findByClassYear(classYearId);

    return courseClasses.map(cc => ({
      id: cc.id,
      courseId: cc.courseId,
      classYearId: cc.classYearId,
      teacherId: cc.teacherId,
      hoursPerWeek: cc.hoursPerWeek,
      coefficient: cc.coefficient,
      isActive: cc.isActive,
      createdAt: cc.createdAt,
      updatedAt: cc.updatedAt,
    }));
  }
}
