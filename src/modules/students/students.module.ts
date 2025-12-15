import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { Student } from '../../entities/student.entity';
import { StudentInscription } from '../../entities/student-inscription.entity';
import { ClassYear } from '../../entities/class-year.entity';
import { StudentController } from './infrastructure/controllers/student.controller';
import { RegisterStudentUseCase } from './application/use-cases/register-student.use-case';
import { GetStudentsByAcademicYearUseCase } from './application/use-cases/get-students-by-academic-year.use-case';
import { GetStudentByIdUseCase } from './application/use-cases/get-student-by-id.use-case';
import { UpdateStudentUseCase } from './application/use-cases/update-student.use-case';
import { GetInscriptionsByAcademicYearUseCase } from './application/use-cases/get-inscriptions-by-academic-year.use-case';
import { GetInscriptionsByClassYearUseCase } from './application/use-cases/get-inscriptions-by-class-year.use-case';
import { UpdateInscriptionUseCase } from './application/use-cases/update-inscription.use-case';
import { StudentRepositoryAdapter } from './infrastructure/adapters/student-repository.adapter';
import { StudentInscriptionRepositoryAdapter } from './infrastructure/adapters/student-inscription-repository.adapter';
import { STUDENT_REPOSITORY } from './application/ports/student-repository.port';
import { STUDENT_INSCRIPTION_REPOSITORY } from './application/ports/student-inscription-repository.port';
import { ClassesModule } from '../classes/classes.module';

@Module({
  imports: [
    TypeOrmModule.forFeature([Student, StudentInscription, ClassYear]),
    ClassesModule, // Import to access ClassYear repository
  ],
  controllers: [StudentController],
  providers: [
    // Use cases
    RegisterStudentUseCase,
    GetStudentsByAcademicYearUseCase,
    GetStudentByIdUseCase,
    UpdateStudentUseCase,
    GetInscriptionsByAcademicYearUseCase,
    GetInscriptionsByClassYearUseCase,
    UpdateInscriptionUseCase,
    // Repositories
    {
      provide: STUDENT_REPOSITORY,
      useClass: StudentRepositoryAdapter,
    },
    {
      provide: STUDENT_INSCRIPTION_REPOSITORY,
      useClass: StudentInscriptionRepositoryAdapter,
    },
  ],
  exports: [STUDENT_REPOSITORY, STUDENT_INSCRIPTION_REPOSITORY],
})
export class StudentsModule {}

