import { Inject, Injectable, NotFoundException } from '@nestjs/common';
import * as CoursePort from '../ports/course-repository.port';
import { CourseResponse } from '../../domain/course.interface';

@Injectable()
export class GetCourseByIdUseCase {
  constructor(
    @Inject(CoursePort.COURSE_REPOSITORY)
    private readonly courseRepository: CoursePort.ICourseRepository,
  ) {}

  async execute(id: string): Promise<CourseResponse> {
    const course = await this.courseRepository.findById(id);
    if (!course) {
      throw new NotFoundException('Course not found');
    }

    return {
      id: course.id,
      name: course.name,
      code: course.code,
      description: course.description,
      coefficient: course.coefficient,
      category: course.category,
      isActive: course.isActive,
      createdAt: course.createdAt,
      updatedAt: course.updatedAt,
    };
  }
}
