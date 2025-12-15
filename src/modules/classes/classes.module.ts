import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { Class } from '../../entities/class.entity';
import { ClassYear } from '../../entities/class-year.entity';
import { ClassController } from './infrastructure/controllers/class.controller';
import { CreateClassUseCase } from './application/use-cases/create-class.use-case';
import { GetClassesUseCase } from './application/use-cases/get-classes.use-case';
import { GetClassByIdUseCase } from './application/use-cases/get-class-by-id.use-case';
import { UpdateClassUseCase } from './application/use-cases/update-class.use-case';
import { DeleteClassUseCase } from './application/use-cases/delete-class.use-case';
import { CreateClassYearUseCase } from './application/use-cases/create-class-year.use-case';
import { GetClassYearsByAcademicYearUseCase } from './application/use-cases/get-class-years-by-academic-year.use-case';
import { UpdateClassYearUseCase } from './application/use-cases/update-class-year.use-case';
import { SeedDefaultClassesUseCase } from './application/use-cases/seed-default-classes.use-case';
import { ClassRepositoryAdapter } from './infrastructure/adapters/class-repository.adapter';
import { ClassYearRepositoryAdapter } from './infrastructure/adapters/class-year-repository.adapter';
import { CLASS_REPOSITORY } from './application/ports/class-repository.port';
import { CLASS_YEAR_REPOSITORY } from './application/ports/class-year-repository.port';

@Module({
  imports: [TypeOrmModule.forFeature([Class, ClassYear])],
  controllers: [ClassController],
  providers: [
    CreateClassUseCase,
    GetClassesUseCase,
    GetClassByIdUseCase,
    UpdateClassUseCase,
    DeleteClassUseCase,
    CreateClassYearUseCase,
    GetClassYearsByAcademicYearUseCase,
    UpdateClassYearUseCase,
    SeedDefaultClassesUseCase,
    {
      provide: CLASS_REPOSITORY,
      useClass: ClassRepositoryAdapter,
    },
    {
      provide: CLASS_YEAR_REPOSITORY,
      useClass: ClassYearRepositoryAdapter,
    },
  ],
  exports: [CLASS_REPOSITORY, CLASS_YEAR_REPOSITORY],
})
export class ClassesModule {}
