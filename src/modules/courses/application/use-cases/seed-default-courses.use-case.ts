import { Inject, Injectable, Logger, NotFoundException } from '@nestjs/common';
import * as CoursePort from '../ports/course-repository.port';
import * as CourseClassPort from '../ports/course-class-repository.port';
import * as ClassPort from '../../../classes/application/ports/class-repository.port';
import * as ClassYearPort from '../../../classes/application/ports/class-year-repository.port';
import { CourseResponse, CourseClassResponse } from '../../domain/course.interface';

interface DefaultCourseData {
  name: string;
  code: string;
  description?: string;
  coefficient?: number;
  category?: string;
}

interface DefaultCoursesMap {
  [className: string]: DefaultCourseData[];
}

export interface SeedResult {
  courses: {
    created: CourseResponse[];
    skipped: string[];
  };
  courseClasses: {
    created: CourseClassResponse[];
    skipped: string[];
    errors: string[];
  };
}

@Injectable()
export class SeedDefaultCoursesUseCase {
  private readonly logger = new Logger(SeedDefaultCoursesUseCase.name);

  constructor(
    @Inject(CoursePort.COURSE_REPOSITORY)
    private readonly courseRepository: CoursePort.ICourseRepository,
    @Inject(CourseClassPort.COURSE_CLASS_REPOSITORY)
    private readonly courseClassRepository: CourseClassPort.ICourseClassRepository,
    @Inject(ClassPort.CLASS_REPOSITORY)
    private readonly classRepository: ClassPort.IClassRepository,
    @Inject(ClassYearPort.CLASS_YEAR_REPOSITORY)
    private readonly classYearRepository: ClassYearPort.IClassYearRepository,
  ) {}

  async execute(academyId: string, academicYearId: string): Promise<SeedResult> {
    let defaultCoursesMap: DefaultCoursesMap;
    try {
      // Use require which works with both src and dist folders
      defaultCoursesMap = require('../../infrastructure/data/default-courses.json');
    } catch (error) {
      this.logger.error('Failed to load default courses data', error);
      throw new Error('Failed to load default courses data');
    }

    const result: SeedResult = {
      courses: {
        created: [],
        skipped: [],
      },
      courseClasses: {
        created: [],
        skipped: [],
        errors: [],
      },
    };

    // Get all class years for the current academic year
    const classYears = await this.classYearRepository.findByAcademicYear(academicYearId);
    const classYearMap = new Map(classYears.map(cy => [cy.class?.name, cy]));

    this.logger.log(`Found ${classYears.length} class years for academic year ${academicYearId}`);

    // Process each class and its courses
    for (const [className, courses] of Object.entries(defaultCoursesMap)) {
      this.logger.log(`Processing courses for class: ${className}`);

      for (const courseData of courses) {
        // Check if course already exists
        let course = await this.courseRepository.findByCode(courseData.code);
        
        if (!course) {
          // Create the course
          course = await this.courseRepository.create({
            name: courseData.name,
            code: courseData.code,
            description: courseData.description,
            coefficient: courseData.coefficient,
            category: courseData.category,
            isActive: true,
          });

          result.courses.created.push({
            id: course.id,
            name: course.name,
            code: course.code,
            description: course.description,
            coefficient: course.coefficient,
            category: course.category,
            isActive: course.isActive,
            createdAt: course.createdAt,
            updatedAt: course.updatedAt,
          });

          this.logger.log(`Created course: ${courseData.name} (${courseData.code})`);
        } else {
          result.courses.skipped.push(courseData.code);
          this.logger.log(`Skipping course ${courseData.code} - already exists`);
        }

        // Associate course with class year (current academic year)
        const classYear = classYearMap.get(className);
        if (!classYear) {
          const errorMsg = `Class year not found for class: ${className}. Create class years first.`;
          result.courseClasses.errors.push(errorMsg);
          this.logger.warn(errorMsg);
          continue;
        }

        // Check if course class already exists
        const existingCourseClass = await this.courseClassRepository.findByCourseAndClassYear(
          course.id,
          classYear.id,
        );

        if (existingCourseClass) {
          result.courseClasses.skipped.push(`${courseData.code}-${className}`);
          this.logger.log(`Skipping course class ${courseData.code} for ${className} - already exists`);
          continue;
        }

        // Create course class
        const courseClass = await this.courseClassRepository.create({
          courseId: course.id,
          classYearId: classYear.id,
          coefficient: courseData.coefficient ?? 1,
          isActive: true,
        });

        result.courseClasses.created.push({
          id: courseClass.id,
          courseId: courseClass.courseId,
          classYearId: courseClass.classYearId,
          teacherId: courseClass.teacherId,
          hoursPerWeek: courseClass.hoursPerWeek,
          coefficient: courseClass.coefficient,
          isActive: courseClass.isActive,
          createdAt: courseClass.createdAt,
          updatedAt: courseClass.updatedAt,
        });

        this.logger.log(`Created course class: ${courseData.code} for ${className}`);
      }
    }

    return result;
  }
}
