import { Inject, Injectable, NotFoundException } from '@nestjs/common';
import * as CourseClassPort from '../ports/course-class-repository.port';
import { CourseClassResponse } from '../../domain/course.interface';
import { CLASS_REPOSITORY } from '../../../classes/application/ports/class-repository.port';
import { CLASS_YEAR_REPOSITORY } from '../../../classes/application/ports/class-year-repository.port';
import { ACADEMIC_YEAR_REPOSITORY } from '../../../academy/application/ports/academic-year-repository.port';

@Injectable()
export class GetCoursesByClassCodeUseCase {
  constructor(
    @Inject(CourseClassPort.COURSE_CLASS_REPOSITORY)
    private readonly courseClassRepository: CourseClassPort.ICourseClassRepository,
    @Inject(CLASS_REPOSITORY)
    private readonly classRepository: any,
    @Inject(CLASS_YEAR_REPOSITORY)
    private readonly classYearRepository: any,
    @Inject(ACADEMIC_YEAR_REPOSITORY)
    private readonly academicYearRepository: any,
  ) {}

  async execute(classCode: string, academyId: string): Promise<CourseClassResponse[]> {
    // Find the class by code
    const classEntity = await this.classRepository.findByCode(classCode);
    
    if (!classEntity) {
      throw new NotFoundException(`Class with code '${classCode}' not found`);
    }

    // Find the current academic year for the academy
    const currentAcademicYear = await this.academicYearRepository.findCurrentByAcademyId(academyId);
    
    if (!currentAcademicYear) {
      throw new NotFoundException('No current academic year set for this academy');
    }

    // Find the ClassYear for this class and the current academic year
    const classYear = await this.classYearRepository.findByClassAndAcademicYear(
      classEntity.id,
      currentAcademicYear.id,
    );

    if (!classYear) {
      throw new NotFoundException(
        `Class '${classCode}' does not have an entry for the current academic year`,
      );
    }

    // Get all courses for this class year
    const courseClasses = await this.courseClassRepository.findByClassYear(classYear.id);

    // Map to response format with course details
    return courseClasses.map(cc => ({
      id: cc.id,
      courseId: cc.courseId,
      classYearId: cc.classYearId,
      teacherId: cc.teacherId,
      hoursPerWeek: cc.hoursPerWeek,
      coefficient: cc.coefficient,
      isActive: cc.isActive,
      course: cc.course ? {
        id: cc.course.id,
        name: cc.course.name,
        code: cc.course.code,
        description: cc.course.description,
        coefficient: cc.course.coefficient,
        category: cc.course.category,
        isActive: cc.course.isActive,
        createdAt: cc.course.createdAt,
        updatedAt: cc.course.updatedAt,
      } : undefined,
      createdAt: cc.createdAt,
      updatedAt: cc.updatedAt,
    }));
  }
}
