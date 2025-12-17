import { Injectable, Inject, NotFoundException, ForbiddenException, ConflictException, BadRequestException } from '@nestjs/common';
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
import { CreateNoteDto } from '../../infrastructure/dtos/create-note.dto';
import * as courseRepositoryPort from '../ports/course-repository.port';
import * as studentRepositoryPort from '../ports/student-repository.port';

@Injectable()
export class CreateNoteUseCase {
  constructor(
    @Inject(NOTE_REPOSITORY)
    private readonly noteRepository: INoteRepository,
    @Inject(STUDENT_INSCRIPTION_REPOSITORY)
    private readonly inscriptionRepository: IStudentInscriptionRepository,
    @Inject(TEST_REPOSITORY)
    private readonly testRepository: ITestRepository,
    @Inject(courseRepositoryPort.COURSE_REPOSITORY)
    private readonly courseRepository: courseRepositoryPort.ICourseRepository,
    @Inject(studentRepositoryPort.STUDENT_REPOSITORY)
    private readonly studentRepository: studentRepositoryPort.IStudentRepository,
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
    request: CreateNoteDto,
    academicYearId: string,
    userId: string,
  ) {
    // Resolve registrationNumber to studentId
    const student = await this.studentRepository.findByRegistrationNumber(
      request.registrationNumber,
    );
    if (!student) {
      throw new NotFoundException(
        `Student with registration number '${request.registrationNumber}' not found`,
      );
    }
    const studentId = student.id;

    // Resolve courseCode to courseId
    const course = await this.courseRepository.findByCode(request.courseCode);
    if (!course) {
      throw new NotFoundException(
        `Course with code '${request.courseCode}' not found`,
      );
    }
    const courseId = course.id;

    // Resolve testCode to testId
    const testId = await this.findTestByCode(request.testCode, academicYearId);

    // Validate that student is enrolled in the course for this academic year
    const isEnrolled = await this.inscriptionRepository.isStudentEnrolledInCourse(
      studentId,
      courseId,
      academicYearId,
    );

    if (!isEnrolled) {
      throw new ForbiddenException(
        `Student is not enrolled in this course for the current academic year`,
      );
    }

    // Check if note already exists for this student and test
    const existingNote = await this.noteRepository.findByStudentAndTest(
      studentId,
      testId,
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
      studentId,
      testId,
      courseId,
      score: request.score,
      maxScore,
      isAbsent: request.isAbsent,
      comment: request.comment,
      enteredBy: userId,
      enteredAt: new Date(),
    });

    return note;
  }
}
