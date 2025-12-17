import { Injectable, Inject, NotFoundException, ForbiddenException, BadRequestException } from '@nestjs/common';
import type {
  INoteRepository,
} from '../ports/note-repository.port';
import { NOTE_REPOSITORY } from '../ports/note-repository.port';
import type {
  IStudentInscriptionRepository,
} from '../ports/student-inscription-repository.port';
import { STUDENT_INSCRIPTION_REPOSITORY } from '../ports/student-inscription-repository.port';
import type {
  ITestRepository,
} from '../ports/test-repository.port';
import { TEST_REPOSITORY } from '../ports/test-repository.port';
import { COURSE_REPOSITORY } from '../ports/course-repository.port';
import type {
  ICourseRepository,
} from '../ports/course-repository.port';
import { STUDENT_REPOSITORY } from '../ports/student-repository.port';
import type {
  IStudentRepository,
} from '../ports/student-repository.port';
import { BulkUpdateNotesDto } from '../../infrastructure/dtos/bulk-update-notes.dto';

@Injectable()
export class BulkUpdateNotesByTestAndCourseUseCase {
  constructor(
    @Inject(NOTE_REPOSITORY)
    private readonly noteRepository: INoteRepository,
    @Inject(STUDENT_INSCRIPTION_REPOSITORY)
    private readonly inscriptionRepository: IStudentInscriptionRepository,
    @Inject(TEST_REPOSITORY)
    private readonly testRepository: ITestRepository,
    @Inject(COURSE_REPOSITORY)
    private readonly courseRepository: ICourseRepository,
    @Inject(STUDENT_REPOSITORY)
    private readonly studentRepository: IStudentRepository,
  ) {}

  /**
   * Parse testCode in format "TrimX-Y" to get trimester order and test index
   * Example: "Trim1-1" -> { trimesterOrder: 1, testIndex: 1 }
   */
  private parseTestCode(testCode: string): { trimesterOrder: number; testIndex: number } {
    const match = testCode.match(/^Trim(\d+)-(\d+)$/);
    if (!match) {
      throw new BadRequestException(
        'Invalid testCode format. Expected format: TrimX-Y (e.g., Trim1-1)',
      );
    }
    return {
      trimesterOrder: parseInt(match[1], 10),
      testIndex: parseInt(match[2], 10),
    };
  }

  /**
   * Find test by trimester order and test index within that trimester
   */
  private async findTestByCode(
    testCode: string,
    academicYearId: string,
  ): Promise<string> {
    const { trimesterOrder, testIndex } = this.parseTestCode(testCode);
    
    const test = await this.testRepository.findByTrimesterOrderAndTestIndex(
      trimesterOrder,
      testIndex,
      academicYearId,
    );

    if (!test) {
      throw new NotFoundException(
        `Test with code '${testCode}' not found for the current academic year`,
      );
    }

    return test.id;
  }

  async execute(
    testCode: string,
    courseCode: string,
    request: BulkUpdateNotesDto,
    academicYearId: string,
    userId: string,
  ) {
    // Resolve courseCode to courseId
    const course = await this.courseRepository.findByCode(courseCode);
    if (!course) {
      throw new NotFoundException(
        `Course with code '${courseCode}' not found`,
      );
    }
    const courseId = course.id;

    // Resolve testCode to testId
    const testId = await this.findTestByCode(testCode, academicYearId);

    // Validate all students are enrolled in the course and resolve registration numbers to IDs
    const resolvedNotesData: any[] = [];
    for (const noteData of request.notes) {
      const student = await this.studentRepository.findByRegistrationNumber(
        noteData.registrationNumber,
      );
      if (!student) {
        throw new NotFoundException(
          `Student with registration number '${noteData.registrationNumber}' not found`,
        );
      }
      const studentId = student.id;

      const isEnrolled = await this.inscriptionRepository.isStudentEnrolledInCourse(
        studentId,
        courseId,
        academicYearId,
      );

      if (!isEnrolled) {
        throw new ForbiddenException(
          `Student ${noteData.registrationNumber} is not enrolled in this course`,
        );
      }

      // Validate score
      const maxScore = noteData.maxScore || 20;
      if (noteData.score > maxScore) {
        throw new ForbiddenException(
          `Score (${noteData.score}) cannot exceed max score (${maxScore}) for student ${noteData.registrationNumber}`,
        );
      }

      resolvedNotesData.push({
        studentId,
        testId,
        courseId,
        score: noteData.score,
        maxScore,
        isAbsent: noteData.isAbsent || false,
        comment: noteData.comment,
        enteredBy: userId,
        enteredAt: new Date(),
      });
    }

    // Bulk upsert notes
    const notes = await this.noteRepository.bulkUpsert(resolvedNotesData);

    return {
      message: `Successfully updated ${notes.length} notes`,
      notes,
    };
  }
}
