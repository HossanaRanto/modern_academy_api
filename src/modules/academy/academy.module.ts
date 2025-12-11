import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { Academy } from '../../entities/academy.entity';
import { AcademicYear } from '../../entities/academic-year.entity';
import { User } from '../../entities/user.entity';
import { AcademyController } from './infrastructure/controllers/academy.controller';
import { CreateAcademyUseCase } from './application/use-cases/create-academy.use-case';
import { GetAcademyUseCase } from './application/use-cases/get-academy.use-case';
import { CreateAcademicYearUseCase } from './application/use-cases/create-academic-year.use-case';
import { GetAcademicYearsUseCase } from './application/use-cases/get-academic-years.use-case';
import { GetAcademicYearByIdUseCase } from './application/use-cases/get-academic-year-by-id.use-case';
import { SetCurrentAcademicYearUseCase } from './application/use-cases/set-current-academic-year.use-case';
import { AcademyRepositoryAdapter } from './infrastructure/adapters/academy-repository.adapter';
import { AcademicYearRepositoryAdapter } from './infrastructure/adapters/academic-year-repository.adapter';
import { UserRepositoryAdapter } from '../auth/infrastructure/adapters/user-repository.adapter';
import { ACADEMY_REPOSITORY } from './application/ports/academy-repository.port';
import { ACADEMIC_YEAR_REPOSITORY } from './application/ports/academic-year-repository.port';
import { USER_REPOSITORY } from '../auth/application/ports/user-repository.port';

@Module({
  imports: [TypeOrmModule.forFeature([Academy, AcademicYear, User])],
  controllers: [AcademyController],
  providers: [
    CreateAcademyUseCase,
    GetAcademyUseCase,
    CreateAcademicYearUseCase,
    GetAcademicYearsUseCase,
    GetAcademicYearByIdUseCase,
    SetCurrentAcademicYearUseCase,
    {
      provide: ACADEMY_REPOSITORY,
      useClass: AcademyRepositoryAdapter,
    },
    {
      provide: ACADEMIC_YEAR_REPOSITORY,
      useClass: AcademicYearRepositoryAdapter,
    },
    {
      provide: USER_REPOSITORY,
      useClass: UserRepositoryAdapter,
    },
  ],
  exports: [],
})
export class AcademyModule {}
