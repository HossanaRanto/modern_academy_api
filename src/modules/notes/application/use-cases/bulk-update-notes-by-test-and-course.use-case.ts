import { Injectable, Inject, NotFoundException, ForbiddenException } from '@nestjs/common';
import type {
  INoteRepository,
} from '../ports/note-repository.port';
import { NOTE_REPOSITORY } from '../ports/note-repository.port';
import type {
  IStudentInscriptionRepository,
} from '../ports/student-inscription-repository.port';
import { STUDENT_INSCRIPTION_REPOSITORY } from '../ports/student-inscription-repository.port';
import { BulkUpdateNotesDto } from '../../infrastructure/dtos/bulk-update-notes.dto';

@Injectable()
export class BulkUpdateNotesByTestAndCourseUseCase {
  constructor(
    @Inject(NOTE_REPOSITORY)
    private readonly noteRepository: INoteRepository,
    @Inject(STUDENT_INSCRIPTION_REPOSITORY)
    private readonly inscriptionRepository: IStudentInscriptionRepository,
  ) {}

  async execute(
    testId: string,
    courseId: string,
    request: BulkUpdateNotesDto,
    academicYearId: string,
    userId: string,
  ) {
    // Validate all students are enrolled in the course
    for (const noteData of request.notes) {
      const isEnrolled = await this.inscriptionRepository.isStudentEnrolledInCourse(
        noteData.studentId,
        courseId,
        academicYearId,
      );

      if (!isEnrolled) {
        throw new ForbiddenException(
          `Student ${noteData.studentId} is not enrolled in this course`,
        );
      }

      // Validate score
      const maxScore = noteData.maxScore || 20;
      if (noteData.score > maxScore) {
        throw new ForbiddenException(
          `Score (${noteData.score}) cannot exceed max score (${maxScore}) for student ${noteData.studentId}`,
        );
      }
    }

    // Prepare notes data for bulk upsert
    const notesData = request.notes.map((noteData) => ({
      studentId: noteData.studentId,
      testId,
      courseId,
      score: noteData.score,
      maxScore: noteData.maxScore || 20,
      isAbsent: noteData.isAbsent || false,
      comment: noteData.comment,
      enteredBy: userId,
      enteredAt: new Date(),
    }));

    // Bulk upsert notes
    const notes = await this.noteRepository.bulkUpsert(notesData);

    return {
      message: `Successfully updated ${notes.length} notes`,
      notes,
    };
  }
}
