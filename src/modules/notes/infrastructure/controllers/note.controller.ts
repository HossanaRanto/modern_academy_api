import {
  Controller,
  Post,
  Get,
  Body,
  UseGuards,
  Param,
  Patch,
  Delete,
  Query,
  HttpCode,
  HttpStatus,
} from '@nestjs/common';
import {
  ApiTags,
  ApiOperation,
  ApiResponse,
  ApiBody,
  ApiBearerAuth,
  ApiParam,
  ApiQuery,
  ApiSecurity,
} from '@nestjs/swagger';
import { CreateNoteUseCase } from '../../application/use-cases/create-note.use-case';
import { UpdateNoteUseCase } from '../../application/use-cases/update-note.use-case';
import { GetNotesByStudentUseCase } from '../../application/use-cases/get-notes-by-student.use-case';
import { GetNotesByTestUseCase } from '../../application/use-cases/get-notes-by-test.use-case';
import { DeleteNoteUseCase } from '../../application/use-cases/delete-note.use-case';
import { BulkUpdateNotesByTestAndCourseUseCase } from '../../application/use-cases/bulk-update-notes-by-test-and-course.use-case';
import { BulkUpdateAllStudentNotesUseCase } from '../../application/use-cases/bulk-update-all-student-notes.use-case';
import { CreateNoteDto } from '../dtos/create-note.dto';
import { UpdateNoteDto } from '../dtos/update-note.dto';
import { BulkUpdateNotesDto } from '../dtos/bulk-update-notes.dto';
import { JwtAuthGuard } from '../../../../shared/guards/jwt-auth.guard';
import { TenantGuard } from '../../../../shared/guards/tenant.guard';
import { AcademicYearGuard } from '../../../../shared/guards/academic-year.guard';
import { TenantRequired } from '../../../../shared/decorators/tenant-required.decorator';
import { RequireAcademicYear } from '../../../../shared/decorators/require-academic-year.decorator';
import { CurrentAcademicYear } from '../../../../shared/decorators/current-academic-year.decorator';
import { CurrentUser } from '../../../../shared/decorators/current-user.decorator';

@ApiTags('Notes')
@ApiBearerAuth('JWT-auth')
@Controller('notes')
@UseGuards(JwtAuthGuard, TenantGuard, AcademicYearGuard)
@TenantRequired()
@RequireAcademicYear()
export class NoteController {
  constructor(
    private readonly createNoteUseCase: CreateNoteUseCase,
    private readonly updateNoteUseCase: UpdateNoteUseCase,
    private readonly getNotesByStudentUseCase: GetNotesByStudentUseCase,
    private readonly getNotesByTestUseCase: GetNotesByTestUseCase,
    private readonly deleteNoteUseCase: DeleteNoteUseCase,
    private readonly bulkUpdateNotesByTestAndCourseUseCase: BulkUpdateNotesByTestAndCourseUseCase,
    private readonly bulkUpdateAllStudentNotesUseCase: BulkUpdateAllStudentNotesUseCase,
  ) {}

  @Post()
  @HttpCode(HttpStatus.CREATED)
  @ApiSecurity('AcademicYear')
  @ApiOperation({
    summary: 'Create a note',
    description: 'Create a note for a student. Validates that the student is enrolled in the course.',
  })
  @ApiBody({ type: CreateNoteDto })
  @ApiResponse({
    status: 201,
    description: 'Note successfully created',
  })
  @ApiResponse({ status: 401, description: 'Unauthorized' })
  @ApiResponse({ status: 403, description: 'Student not enrolled in course or score exceeds max' })
  @ApiResponse({ status: 409, description: 'Note already exists' })
  async createNote(
    @Body() request: CreateNoteDto,
    @CurrentAcademicYear() academicYearId: string,
    @CurrentUser() user: any,
  ) {
    return this.createNoteUseCase.execute(request, academicYearId, user.id);
  }

  @Get('student/:studentId')
  @HttpCode(HttpStatus.OK)
  @ApiSecurity('AcademicYear')
  @ApiOperation({
    summary: 'Get notes by student',
    description: 'Retrieve all notes for a specific student, optionally filtered by course.',
  })
  @ApiParam({
    name: 'studentId',
    description: 'Student UUID',
  })
  @ApiQuery({
    name: 'courseId',
    required: false,
    description: 'Filter by course UUID',
  })
  @ApiResponse({
    status: 200,
    description: 'List of notes',
  })
  @ApiResponse({ status: 401, description: 'Unauthorized' })
  async getNotesByStudent(
    @Param('studentId') studentId: string,
    @Query('courseId') courseId?: string,
  ) {
    return this.getNotesByStudentUseCase.execute(studentId, courseId);
  }

  @Get('test/:testId')
  @HttpCode(HttpStatus.OK)
  @ApiSecurity('AcademicYear')
  @ApiOperation({
    summary: 'Get notes by test',
    description: 'Retrieve all notes for a specific test, optionally filtered by course.',
  })
  @ApiParam({
    name: 'testId',
    description: 'Test UUID',
  })
  @ApiQuery({
    name: 'courseId',
    required: false,
    description: 'Filter by course UUID',
  })
  @ApiResponse({
    status: 200,
    description: 'List of notes',
  })
  @ApiResponse({ status: 401, description: 'Unauthorized' })
  async getNotesByTest(
    @Param('testId') testId: string,
    @Query('courseId') courseId?: string,
  ) {
    return this.getNotesByTestUseCase.execute(testId, courseId);
  }

  @Post('bulk/test/:testCode/course/:courseCode')
  @HttpCode(HttpStatus.OK)
  @ApiSecurity('AcademicYear')
  @ApiOperation({
    summary: 'Bulk update notes for a test and course',
    description: 'Update all student notes for a specific test and course in a class. Creates or updates notes. Test code format: TrimX-Y (e.g., Trim1-1 for first trimester first test). Course code can be any code like MATH101.',
  })
  @ApiParam({
    name: 'testCode',
    description: 'Test code in format TrimX-Y (e.g., Trim1-1)',
  })
  @ApiParam({
    name: 'courseCode',
    description: 'Course code (e.g., MATH101)',
  })
  @ApiBody({ type: BulkUpdateNotesDto })
  @ApiResponse({
    status: 200,
    description: 'Notes successfully updated',
    schema: {
      example: {
        message: 'Successfully updated 25 notes',
        notes: [],
      },
    },
  })
  @ApiResponse({ status: 401, description: 'Unauthorized' })
  @ApiResponse({ status: 403, description: 'Student not enrolled in course' })
  async bulkUpdateNotesByTestAndCourse(
    @Param('testCode') testCode: string,
    @Param('courseCode') courseCode: string,
    @Body() request: BulkUpdateNotesDto,
    @CurrentAcademicYear() academicYearId: string,
    @CurrentUser() user: any,
  ) {
    return this.bulkUpdateNotesByTestAndCourseUseCase.execute(
      testCode,
      courseCode,
      request,
      academicYearId,
      user.id,
    );
  }

  @Post('bulk/student/:studentId/all-courses')
  @HttpCode(HttpStatus.OK)
  @ApiSecurity('AcademicYear')
  @ApiOperation({
    summary: 'Bulk update all notes for a student',
    description: 'Update all notes for a student across all courses. Creates or updates notes.',
  })
  @ApiParam({
    name: 'studentId',
    description: 'Student UUID',
  })
  @ApiBody({
    schema: {
      type: 'object',
      properties: {
        notes: {
          type: 'array',
          items: {
            type: 'object',
            properties: {
              courseId: { type: 'string', format: 'uuid' },
              testId: { type: 'string', format: 'uuid' },
              score: { type: 'number', minimum: 0 },
              maxScore: { type: 'number', minimum: 0 },
              isAbsent: { type: 'boolean' },
              comment: { type: 'string' },
            },
            required: ['courseId', 'testId', 'score'],
          },
        },
      },
    },
  })
  @ApiResponse({
    status: 200,
    description: 'Notes successfully updated',
    schema: {
      example: {
        message: 'Successfully updated 15 notes for student',
        notes: [],
      },
    },
  })
  @ApiResponse({ status: 401, description: 'Unauthorized' })
  @ApiResponse({ status: 403, description: 'Student not enrolled in course' })
  async bulkUpdateAllStudentNotes(
    @Param('studentId') studentId: string,
    @Body() request: any,
    @CurrentAcademicYear() academicYearId: string,
    @CurrentUser() user: any,
  ) {
    return this.bulkUpdateAllStudentNotesUseCase.execute(
      studentId,
      request,
      academicYearId,
      user.id,
    );
  }

  @Patch(':id')
  @HttpCode(HttpStatus.OK)
  @ApiSecurity('AcademicYear')
  @ApiOperation({
    summary: 'Update a note',
    description: 'Update note details.',
  })
  @ApiParam({
    name: 'id',
    description: 'Note UUID',
  })
  @ApiBody({ type: UpdateNoteDto })
  @ApiResponse({
    status: 200,
    description: 'Note successfully updated',
  })
  @ApiResponse({ status: 401, description: 'Unauthorized' })
  @ApiResponse({ status: 404, description: 'Note not found' })
  async updateNote(
    @Param('id') id: string,
    @Body() request: UpdateNoteDto,
    @CurrentUser() user: any,
  ) {
    return this.updateNoteUseCase.execute(id, request, user.id);
  }

  @Delete(':id')
  @HttpCode(HttpStatus.OK)
  @ApiSecurity('AcademicYear')
  @ApiOperation({
    summary: 'Delete a note',
    description: 'Delete a note by ID.',
  })
  @ApiParam({
    name: 'id',
    description: 'Note UUID',
  })
  @ApiResponse({
    status: 200,
    description: 'Note successfully deleted',
    schema: {
      example: {
        message: 'Note deleted successfully',
      },
    },
  })
  @ApiResponse({ status: 401, description: 'Unauthorized' })
  @ApiResponse({ status: 404, description: 'Note not found' })
  async deleteNote(@Param('id') id: string) {
    return this.deleteNoteUseCase.execute(id);
  }
}
