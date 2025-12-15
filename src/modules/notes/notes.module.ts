import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { Trimester } from '../../entities/trimester.entity';
import { Test } from '../../entities/test.entity';
import { Note } from '../../entities/note.entity';
import { TrimesterController } from './infrastructure/controllers/trimester.controller';
import { TestController } from './infrastructure/controllers/test.controller';
import { CreateTrimesterUseCase } from './application/use-cases/create-trimester.use-case';
import { GetTrimestersByAcademicYearUseCase } from './application/use-cases/get-trimesters-by-academic-year.use-case';
import { GetTrimesterByIdUseCase } from './application/use-cases/get-trimester-by-id.use-case';
import { UpdateTrimesterUseCase } from './application/use-cases/update-trimester.use-case';
import { DeleteTrimesterUseCase } from './application/use-cases/delete-trimester.use-case';
import { CreateTestUseCase } from './application/use-cases/create-test.use-case';
import { GetTestsByTrimesterUseCase } from './application/use-cases/get-tests-by-trimester.use-case';
import { GetTestsByCourseClassUseCase } from './application/use-cases/get-tests-by-course-class.use-case';
import { GetTestByIdUseCase } from './application/use-cases/get-test-by-id.use-case';
import { UpdateTestUseCase } from './application/use-cases/update-test.use-case';
import { DeleteTestUseCase } from './application/use-cases/delete-test.use-case';
import { TrimesterRepositoryAdapter } from './infrastructure/adapters/trimester-repository.adapter';
import { TestRepositoryAdapter } from './infrastructure/adapters/test-repository.adapter';
import { NoteRepositoryAdapter } from './infrastructure/adapters/note-repository.adapter';
import { TRIMESTER_REPOSITORY } from './application/ports/trimester-repository.port';
import { TEST_REPOSITORY } from './application/ports/test-repository.port';
import { NOTE_REPOSITORY } from './application/ports/note-repository.port';

@Module({
  imports: [TypeOrmModule.forFeature([Trimester, Test, Note])],
  controllers: [TrimesterController, TestController],
  providers: [
    // Trimester use cases
    CreateTrimesterUseCase,
    GetTrimestersByAcademicYearUseCase,
    GetTrimesterByIdUseCase,
    UpdateTrimesterUseCase,
    DeleteTrimesterUseCase,
    // Test use cases
    CreateTestUseCase,
    GetTestsByTrimesterUseCase,
    GetTestsByCourseClassUseCase,
    GetTestByIdUseCase,
    UpdateTestUseCase,
    DeleteTestUseCase,
    // Repository adapters
    {
      provide: TRIMESTER_REPOSITORY,
      useClass: TrimesterRepositoryAdapter,
    },
    {
      provide: TEST_REPOSITORY,
      useClass: TestRepositoryAdapter,
    },
    {
      provide: NOTE_REPOSITORY,
      useClass: NoteRepositoryAdapter,
    },
  ],
  exports: [TRIMESTER_REPOSITORY, TEST_REPOSITORY, NOTE_REPOSITORY],
})
export class NotesModule {}
