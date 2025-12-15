import { Inject, Injectable, NotFoundException, ConflictException } from '@nestjs/common';
import * as CourseClassPort from '../ports/course-class-repository.port';
import * as CoursePort from '../ports/course-repository.port';
import { CreateCourseClassRequest, CourseClassResponse } from '../../domain/course.interface';

@Injectable()
export class CreateCourseClassUseCase {
  constructor(
    @Inject(CourseClassPort.COURSE_CLASS_REPOSITORY)
    private readonly courseClassRepository: CourseClassPort.ICourseClassRepository,
    @Inject(CoursePort.COURSE_REPOSITORY)
    private readonly courseRepository: CoursePort.ICourseRepository,
  ) {}

  async execute(request: CreateCourseClassRequest): Promise<CourseClassResponse> {
    // Verify course exists
    const course = await this.courseRepository.findById(request.courseId);
    if (!course) {
      throw new NotFoundException('Course not found');
    }

    // Check if course class already exists for this course and class year
    const existingCourseClass = await this.courseClassRepository.findByCourseAndClassYear(
      request.courseId,
      request.classYearId,
    );
    if (existingCourseClass) {
      throw new ConflictException('Course class already exists for this course and class year');
    }

    // Create course class
    const courseClass = await this.courseClassRepository.create({
      courseId: request.courseId,
      classYearId: request.classYearId,
      teacherId: request.teacherId,
      hoursPerWeek: request.hoursPerWeek,
      coefficient: request.coefficient ?? 1,
      isActive: true,
    });

    return {
      id: courseClass.id,
      courseId: courseClass.courseId,
      classYearId: courseClass.classYearId,
      teacherId: courseClass.teacherId,
      hoursPerWeek: courseClass.hoursPerWeek,
      coefficient: courseClass.coefficient,
      isActive: courseClass.isActive,
      createdAt: courseClass.createdAt,
      updatedAt: courseClass.updatedAt,
    };
  }
}
