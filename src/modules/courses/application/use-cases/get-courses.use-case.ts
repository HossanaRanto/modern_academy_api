import { Inject, Injectable } from '@nestjs/common';
import * as CoursePort from '../ports/course-repository.port';
import { CourseResponse } from '../../domain/course.interface';

@Injectable()
export class GetCoursesUseCase {
  constructor(
    @Inject(CoursePort.COURSE_REPOSITORY)
    private readonly courseRepository: CoursePort.ICourseRepository,
  ) {}

  async execute(
    academyId: string, 
    onlyActive: boolean = false,
    category?: string,
  ): Promise<CourseResponse[]> {
    let courses;
    
    if (category) {
      courses = await this.courseRepository.findByCategory(category, academyId);
      if (onlyActive) {
        courses = courses.filter(c => c.isActive);
      }
    } else {
      courses = onlyActive 
        ? await this.courseRepository.findAllActive(academyId)
        : await this.courseRepository.findAll(academyId);
    }

    return courses.map(course => ({
      id: course.id,
      name: course.name,
      code: course.code,
      description: course.description,
      coefficient: course.coefficient,
      category: course.category,
      isActive: course.isActive,
      createdAt: course.createdAt,
      updatedAt: course.updatedAt,
    }));
  }
}
