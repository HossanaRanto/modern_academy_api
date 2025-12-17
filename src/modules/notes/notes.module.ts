import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { Trimester } from '../../entities/trimester.entity';
import { Test } from '../../entities/test.entity';
import { Note } from '../../entities/note.entity';
import { AcademicYear } from '../../entities/academic-year.entity';
import { StudentInscription } from '../../entities/student-inscription.entity';
import { CourseClass } from '../../entities/course-class.entity';
import { Course } from '../../entities/course.entity';
import { Student } from '../../entities/student.entity';
import { TrimesterController } from './infrastructure/controllers/trimester.controller';
import { TestController } from './infrastructure/controllers/test.controller';
import { NoteController } from './infrastructure/controllers/note.controller';
import { CreateTrimesterUseCase } from './application/use-cases/create-trimester.use-case';
import { GetTrimestersByAcademicYearUseCase } from './application/use-cases/get-trimesters-by-academic-year.use-case';
import { GetTrimesterByIdUseCase } from './application/use-cases/get-trimester-by-id.use-case';
import { UpdateTrimesterUseCase } from './application/use-cases/update-trimester.use-case';
import { DeleteTrimesterUseCase } from './application/use-cases/delete-trimester.use-case';
import { CreateTestUseCase } from './application/use-cases/create-test.use-case';
import { GetTestsByTrimesterUseCase } from './application/use-cases/get-tests-by-trimester.use-case';
import { GetTestByIdUseCase } from './application/use-cases/get-test-by-id.use-case';
import { UpdateTestUseCase } from './application/use-cases/update-test.use-case';
import { DeleteTestUseCase } from './application/use-cases/delete-test.use-case';
import { CreateNoteUseCase } from './application/use-cases/create-note.use-case';
import { UpdateNoteUseCase } from './application/use-cases/update-note.use-case';
import { GetNotesByStudentUseCase } from './application/use-cases/get-notes-by-student.use-case';
import { GetNotesByTestUseCase } from './application/use-cases/get-notes-by-test.use-case';
import { DeleteNoteUseCase } from './application/use-cases/delete-note.use-case';
import { BulkUpdateNotesByTestAndCourseUseCase } from './application/use-cases/bulk-update-notes-by-test-and-course.use-case';
import { BulkUpdateAllStudentNotesUseCase } from './application/use-cases/bulk-update-all-student-notes.use-case';
import { TrimesterRepositoryAdapter } from './infrastructure/adapters/trimester-repository.adapter';
import { TestRepositoryAdapter } from './infrastructure/adapters/test-repository.adapter';
import { NoteRepositoryAdapter } from './infrastructure/adapters/note-repository.adapter';
import { StudentInscriptionRepositoryAdapter } from './infrastructure/adapters/student-inscription-repository.adapter';
import { CourseRepositoryAdapter } from '../courses/infrastructure/adapters/course-repository.adapter';
import { StudentRepositoryAdapter } from '../students/infrastructure/adapters/student-repository.adapter';
import { TRIMESTER_REPOSITORY } from './application/ports/trimester-repository.port';
import { TEST_REPOSITORY } from './application/ports/test-repository.port';
import { NOTE_REPOSITORY } from './application/ports/note-repository.port';
import { STUDENT_INSCRIPTION_REPOSITORY } from './application/ports/student-inscription-repository.port';
import { COURSE_REPOSITORY } from './application/ports/course-repository.port';
import { STUDENT_REPOSITORY } from './application/ports/student-repository.port';

@Module({
  imports: [
    TypeOrmModule.forFeature([
      Trimester,
      Test,
      Note,
      AcademicYear,
      StudentInscription,
      CourseClass,
      Course,
      Student,
    ]),
  ],
  controllers: [TrimesterController, TestController, NoteController],
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
    GetTestByIdUseCase,
    UpdateTestUseCase,
    DeleteTestUseCase,
    // Note use cases
    CreateNoteUseCase,
    UpdateNoteUseCase,
    GetNotesByStudentUseCase,
    GetNotesByTestUseCase,
    DeleteNoteUseCase,
    BulkUpdateNotesByTestAndCourseUseCase,
    BulkUpdateAllStudentNotesUseCase,
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
    {
      provide: STUDENT_INSCRIPTION_REPOSITORY,
      useClass: StudentInscriptionRepositoryAdapter,
    },
    {
      provide: COURSE_REPOSITORY,
      useClass: CourseRepositoryAdapter,
    },
    {
      provide: STUDENT_REPOSITORY,
      useClass: StudentRepositoryAdapter,
    },
  ],
  exports: [
    TRIMESTER_REPOSITORY,
    TEST_REPOSITORY,
    NOTE_REPOSITORY,
    STUDENT_INSCRIPTION_REPOSITORY,
    COURSE_REPOSITORY,
    STUDENT_REPOSITORY,
  ],
})
export class NotesModule {}
