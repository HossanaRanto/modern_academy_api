import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { Student } from '../../entities/student.entity';
import { StudentController } from './infrastructure/controllers/student.controller';
import { CreateStudentUseCase } from './application/use-cases/create-student.use-case';
import { GetAllStudentsUseCase } from './application/use-cases/get-all-students.use-case';
import { StudentRepositoryAdapter } from './infrastructure/adapters/student-repository.adapter';
import { STUDENT_REPOSITORY } from './application/ports/student-repository.port';

@Module({
  imports: [TypeOrmModule.forFeature([Student])],
  controllers: [StudentController],
  providers: [
    CreateStudentUseCase,
    GetAllStudentsUseCase,
    {
      provide: STUDENT_REPOSITORY,
      useClass: StudentRepositoryAdapter,
    },
  ],
  exports: [],
})
export class StudentsModule {}
