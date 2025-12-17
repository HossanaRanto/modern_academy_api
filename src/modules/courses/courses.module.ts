import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { Course } from '../../entities/course.entity';
import { CourseClass } from '../../entities/course-class.entity';
import { ClassesModule } from '../classes/classes.module';
import { AcademyModule } from '../academy/academy.module';
import { CourseController } from './infrastructure/controllers/course.controller';
import { CreateCourseUseCase } from './application/use-cases/create-course.use-case';
import { GetCoursesUseCase } from './application/use-cases/get-courses.use-case';
import { GetCourseByIdUseCase } from './application/use-cases/get-course-by-id.use-case';
import { UpdateCourseUseCase } from './application/use-cases/update-course.use-case';
import { DeleteCourseUseCase } from './application/use-cases/delete-course.use-case';
import { CreateCourseClassUseCase } from './application/use-cases/create-course-class.use-case';
import { GetCourseClassesByClassYearUseCase } from './application/use-cases/get-course-classes-by-class-year.use-case';
import { GetCoursesByClassCodeUseCase } from './application/use-cases/get-courses-by-class-code.use-case';
import { UpdateCourseClassUseCase } from './application/use-cases/update-course-class.use-case';
import { SeedDefaultCoursesUseCase } from './application/use-cases/seed-default-courses.use-case';
import { CourseRepositoryAdapter } from './infrastructure/adapters/course-repository.adapter';
import { CourseClassRepositoryAdapter } from './infrastructure/adapters/course-class-repository.adapter';
import { COURSE_REPOSITORY } from './application/ports/course-repository.port';
import { COURSE_CLASS_REPOSITORY } from './application/ports/course-class-repository.port';

@Module({
  imports: [
    TypeOrmModule.forFeature([Course, CourseClass]),
    ClassesModule,
    AcademyModule,
  ],
  controllers: [CourseController],
  providers: [
    CreateCourseUseCase,
    GetCoursesUseCase,
    GetCourseByIdUseCase,
    UpdateCourseUseCase,
    DeleteCourseUseCase,
    CreateCourseClassUseCase,
    GetCourseClassesByClassYearUseCase,
    GetCoursesByClassCodeUseCase,
    UpdateCourseClassUseCase,
    SeedDefaultCoursesUseCase,
    {
      provide: COURSE_REPOSITORY,
      useClass: CourseRepositoryAdapter,
    },
    {
      provide: COURSE_CLASS_REPOSITORY,
      useClass: CourseClassRepositoryAdapter,
    },
  ],
  exports: [COURSE_REPOSITORY, COURSE_CLASS_REPOSITORY],
})
export class CoursesModule {}
