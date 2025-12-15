import { Inject, Injectable, NotFoundException, ConflictException } from '@nestjs/common';
import * as CoursePort from '../ports/course-repository.port';
import { UpdateCourseRequest, CourseResponse } from '../../domain/course.interface';

@Injectable()
export class UpdateCourseUseCase {
  constructor(
    @Inject(CoursePort.COURSE_REPOSITORY)
    private readonly courseRepository: CoursePort.ICourseRepository,
  ) {}

  async execute(id: string, request: UpdateCourseRequest): Promise<CourseResponse> {
    const course = await this.courseRepository.findById(id);
    if (!course) {
      throw new NotFoundException('Course not found');
    }

    // Check if code is being changed and if it conflicts
    if (request.code && request.code !== course.code) {
      const existingCourse = await this.courseRepository.findByCode(request.code);
      if (existingCourse) {
        throw new ConflictException('Course with this code already exists');
      }
    }

    // Update fields
    if (request.name !== undefined) course.name = request.name;
    if (request.code !== undefined) course.code = request.code;
    if (request.description !== undefined) course.description = request.description;
    if (request.coefficient !== undefined) course.coefficient = request.coefficient;
    if (request.category !== undefined) course.category = request.category;
    if (request.isActive !== undefined) course.isActive = request.isActive;

    const saved = await this.courseRepository.save(course);

    return {
      id: saved.id,
      name: saved.name,
      code: saved.code,
      description: saved.description,
      coefficient: saved.coefficient,
      category: saved.category,
      isActive: saved.isActive,
      createdAt: saved.createdAt,
      updatedAt: saved.updatedAt,
    };
  }
}
