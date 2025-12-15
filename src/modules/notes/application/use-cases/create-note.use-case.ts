import { Injectable, Inject, NotFoundException, ForbiddenException, ConflictException } from '@nestjs/common';
import type {
  INoteRepository,
} from '../ports/note-repository.port';
import { NOTE_REPOSITORY } from '../ports/note-repository.port';
import type {
  IStudentInscriptionRepository,
} from '../ports/student-inscription-repository.port';
import { STUDENT_INSCRIPTION_REPOSITORY } from '../ports/student-inscription-repository.port';
import { CreateNoteDto } from '../../infrastructure/dtos/create-note.dto';

@Injectable()
export class CreateNoteUseCase {
  constructor(
    @Inject(NOTE_REPOSITORY)
    private readonly noteRepository: INoteRepository,
    @Inject(STUDENT_INSCRIPTION_REPOSITORY)
    private readonly inscriptionRepository: IStudentInscriptionRepository,
  ) {}

  async execute(
    request: CreateNoteDto,
    academicYearId: string,
    userId: string,
  ) {
    // Validate that student is enrolled in the course for this academic year
    const isEnrolled = await this.inscriptionRepository.isStudentEnrolledInCourse(
      request.studentId,
      request.courseId,
      academicYearId,
    );

    if (!isEnrolled) {
      throw new ForbiddenException(
        `Student is not enrolled in this course for the current academic year`,
      );
    }

    // Check if note already exists for this student and test
    const existingNote = await this.noteRepository.findByStudentAndTest(
      request.studentId,
      request.testId,
    );

    if (existingNote) {
      throw new ConflictException(
        `A note already exists for this student and test`,
      );
    }

    // Validate score against maxScore
    const maxScore = request.maxScore || 20;
    if (request.score > maxScore) {
      throw new ForbiddenException(
        `Score (${request.score}) cannot exceed max score (${maxScore})`,
      );
    }

    const note = await this.noteRepository.create({
      ...request,
      maxScore,
      enteredBy: userId,
      enteredAt: new Date(),
    });

    return note;
  }
}
