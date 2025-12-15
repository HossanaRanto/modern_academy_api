import { Inject, Injectable, NotFoundException } from '@nestjs/common';
import * as CourseClassPort from '../ports/course-class-repository.port';
import { UpdateCourseClassRequest, CourseClassResponse } from '../../domain/course.interface';

@Injectable()
export class UpdateCourseClassUseCase {
  constructor(
    @Inject(CourseClassPort.COURSE_CLASS_REPOSITORY)
    private readonly courseClassRepository: CourseClassPort.ICourseClassRepository,
  ) {}

  async execute(id: string, request: UpdateCourseClassRequest): Promise<CourseClassResponse> {
    const courseClass = await this.courseClassRepository.findById(id);
    if (!courseClass) {
      throw new NotFoundException('Course class not found');
    }

    // Update fields
    if (request.teacherId !== undefined) courseClass.teacherId = request.teacherId;
    if (request.hoursPerWeek !== undefined) courseClass.hoursPerWeek = request.hoursPerWeek;
    if (request.coefficient !== undefined) courseClass.coefficient = request.coefficient;
    if (request.isActive !== undefined) courseClass.isActive = request.isActive;

    const saved = await this.courseClassRepository.save(courseClass);

    return {
      id: saved.id,
      courseId: saved.courseId,
      classYearId: saved.classYearId,
      teacherId: saved.teacherId,
      hoursPerWeek: saved.hoursPerWeek,
      coefficient: saved.coefficient,
      isActive: saved.isActive,
      createdAt: saved.createdAt,
      updatedAt: saved.updatedAt,
    };
  }
}
