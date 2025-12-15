import { Injectable, Inject, ForbiddenException } from '@nestjs/common';
import type {
  INoteRepository,
} from '../ports/note-repository.port';
import { NOTE_REPOSITORY } from '../ports/note-repository.port';
import type {
  IStudentInscriptionRepository,
} from '../ports/student-inscription-repository.port';
import { STUDENT_INSCRIPTION_REPOSITORY } from '../ports/student-inscription-repository.port';

interface StudentCourseNote {
  courseId: string;
  testId: string;
  score: number;
  maxScore?: number;
  isAbsent?: boolean;
  comment?: string;
}

interface BulkUpdateAllNotesRequest {
  notes: StudentCourseNote[];
}

@Injectable()
export class BulkUpdateAllStudentNotesUseCase {
  constructor(
    @Inject(NOTE_REPOSITORY)
    private readonly noteRepository: INoteRepository,
    @Inject(STUDENT_INSCRIPTION_REPOSITORY)
    private readonly inscriptionRepository: IStudentInscriptionRepository,
  ) {}

  async execute(
    studentId: string,
    request: BulkUpdateAllNotesRequest,
    academicYearId: string,
    userId: string,
  ) {
    // Validate student is enrolled in all courses
    for (const noteData of request.notes) {
      const isEnrolled = await this.inscriptionRepository.isStudentEnrolledInCourse(
        studentId,
        noteData.courseId,
        academicYearId,
      );

      if (!isEnrolled) {
        throw new ForbiddenException(
          `Student is not enrolled in course ${noteData.courseId}`,
        );
      }

      // Validate score
      const maxScore = noteData.maxScore || 20;
      if (noteData.score > maxScore) {
        throw new ForbiddenException(
          `Score (${noteData.score}) cannot exceed max score (${maxScore}) for course ${noteData.courseId}`,
        );
      }
    }

    // Prepare notes data for bulk upsert
    const notesData = request.notes.map((noteData) => ({
      studentId,
      testId: noteData.testId,
      courseId: noteData.courseId,
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
      message: `Successfully updated ${notes.length} notes for student`,
      notes,
    };
  }
}
