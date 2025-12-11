import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { Academy } from '../../entities/academy.entity';
import { User } from '../../entities/user.entity';
import { AcademyController } from './infrastructure/controllers/academy.controller';
import { CreateAcademyUseCase } from './application/use-cases/create-academy.use-case';
import { GetAcademyUseCase } from './application/use-cases/get-academy.use-case';
import { AcademyRepositoryAdapter } from './infrastructure/adapters/academy-repository.adapter';
import { UserRepositoryAdapter } from '../auth/infrastructure/adapters/user-repository.adapter';
import { ACADEMY_REPOSITORY } from './application/ports/academy-repository.port';
import { USER_REPOSITORY } from '../auth/application/ports/user-repository.port';

@Module({
  imports: [TypeOrmModule.forFeature([Academy, User])],
  controllers: [AcademyController],
  providers: [
    CreateAcademyUseCase,
    GetAcademyUseCase,
    {
      provide: ACADEMY_REPOSITORY,
      useClass: AcademyRepositoryAdapter,
    },
    {
      provide: USER_REPOSITORY,
      useClass: UserRepositoryAdapter,
    },
  ],
  exports: [],
})
export class AcademyModule {}
