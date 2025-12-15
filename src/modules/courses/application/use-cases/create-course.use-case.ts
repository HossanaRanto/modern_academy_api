import { Inject, Injectable, ConflictException } from '@nestjs/common';
import * as CoursePort from '../ports/course-repository.port';
import { CreateCourseRequest, CourseResponse } from '../../domain/course.interface';

@Injectable()
export class CreateCourseUseCase {
  constructor(
    @Inject(CoursePort.COURSE_REPOSITORY)
    private readonly courseRepository: CoursePort.ICourseRepository,
  ) {}

  async execute(request: CreateCourseRequest, academyId: string): Promise<CourseResponse> {
    // Check if course with the same code already exists
    const existingCourse = await this.courseRepository.findByCode(request.code);
    if (existingCourse) {
      throw new ConflictException('Course with this code already exists');
    }

    // Create course
    const course = await this.courseRepository.create({
      name: request.name,
      code: request.code,
      description: request.description,
      coefficient: request.coefficient,
      category: request.category,
      isActive: true,
    });

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
