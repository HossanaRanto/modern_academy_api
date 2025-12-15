import { Inject, Injectable, NotFoundException } from '@nestjs/common';
import * as CoursePort from '../ports/course-repository.port';

@Injectable()
export class DeleteCourseUseCase {
  constructor(
    @Inject(CoursePort.COURSE_REPOSITORY)
    private readonly courseRepository: CoursePort.ICourseRepository,
  ) {}

  async execute(id: string): Promise<void> {
    const course = await this.courseRepository.findById(id);
    if (!course) {
      throw new NotFoundException('Course not found');
    }

    await this.courseRepository.delete(id);
  }
}
