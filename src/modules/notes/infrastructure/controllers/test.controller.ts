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
} from '@nestjs/swagger';
import { CreateTestUseCase } from '../../application/use-cases/create-test.use-case';
import { GetTestsByTrimesterUseCase } from '../../application/use-cases/get-tests-by-trimester.use-case';
import { GetTestsByCourseClassUseCase } from '../../application/use-cases/get-tests-by-course-class.use-case';
import { GetTestByIdUseCase } from '../../application/use-cases/get-test-by-id.use-case';
import { UpdateTestUseCase } from '../../application/use-cases/update-test.use-case';
import { DeleteTestUseCase } from '../../application/use-cases/delete-test.use-case';
import { CreateTestDto } from '../dtos/create-test.dto';
import { UpdateTestDto } from '../dtos/update-test.dto';
import { JwtAuthGuard } from '../../../../shared/guards/jwt-auth.guard';
import { TenantGuard } from '../../../../shared/guards/tenant.guard';
import { AcademicYearGuard } from '../../../../shared/guards/academic-year.guard';
import { TenantRequired } from '../../../../shared/decorators/tenant-required.decorator';
import { RequireAcademicYear } from '../../../../shared/decorators/require-academic-year.decorator';

@ApiTags('Tests')
@ApiBearerAuth('JWT-auth')
@Controller('tests')
@UseGuards(JwtAuthGuard, TenantGuard, AcademicYearGuard)
@TenantRequired()
@RequireAcademicYear()
export class TestController {
  constructor(
    private readonly createTestUseCase: CreateTestUseCase,
    private readonly getTestsByTrimesterUseCase: GetTestsByTrimesterUseCase,
    private readonly getTestsByCourseClassUseCase: GetTestsByCourseClassUseCase,
    private readonly getTestByIdUseCase: GetTestByIdUseCase,
    private readonly updateTestUseCase: UpdateTestUseCase,
    private readonly deleteTestUseCase: DeleteTestUseCase,
  ) {}

  @Post()
  @HttpCode(HttpStatus.CREATED)
  @ApiOperation({
    summary: 'Create a new test',
    description: 'Create a new test for a course class and trimester.',
  })
  @ApiBody({ type: CreateTestDto })
  @ApiResponse({
    status: 201,
    description: 'Test successfully created',
    schema: {
      example: {
        id: '880e8400-e29b-41d4-a716-446655440000',
        name: 'Mathematics Mid-Term Exam',
        type: 'exam',
        date: '2025-12-15',
        percentage: 50,
        courseClassId: '550e8400-e29b-41d4-a716-446655440000',
        trimesterId: '770e8400-e29b-41d4-a716-446655440000',
        description: 'Chapters 1-5 covered',
        createdAt: '2025-12-15T10:00:00.000Z',
        updatedAt: '2025-12-15T10:00:00.000Z',
      },
    },
  })
  @ApiResponse({ status: 401, description: 'Unauthorized' })
  @ApiResponse({ status: 404, description: 'Trimester not found' })
  async createTest(@Body() request: CreateTestDto) {
    return this.createTestUseCase.execute(request);
  }

  @Get('trimester/:trimesterId')
  @HttpCode(HttpStatus.OK)
  @ApiOperation({
    summary: 'Get tests by trimester',
    description: 'Retrieve all tests for a specific trimester.',
  })
  @ApiParam({
    name: 'trimesterId',
    description: 'Trimester UUID',
    example: '770e8400-e29b-41d4-a716-446655440000',
  })
  @ApiResponse({
    status: 200,
    description: 'List of tests',
    schema: {
      example: [
        {
          id: '880e8400-e29b-41d4-a716-446655440000',
          name: 'Mathematics Mid-Term Exam',
          type: 'exam',
          date: '2025-12-15',
          percentage: 50,
          courseClassId: '550e8400-e29b-41d4-a716-446655440000',
          trimesterId: '770e8400-e29b-41d4-a716-446655440000',
          description: 'Chapters 1-5 covered',
        },
      ],
    },
  })
  @ApiResponse({ status: 401, description: 'Unauthorized' })
  async getTestsByTrimester(@Param('trimesterId') trimesterId: string) {
    return this.getTestsByTrimesterUseCase.execute(trimesterId);
  }

  @Get('course-class/:courseClassId')
  @HttpCode(HttpStatus.OK)
  @ApiOperation({
    summary: 'Get tests by course class',
    description: 'Retrieve all tests for a specific course class, optionally filtered by trimester.',
  })
  @ApiParam({
    name: 'courseClassId',
    description: 'Course Class UUID',
    example: '550e8400-e29b-41d4-a716-446655440000',
  })
  @ApiQuery({
    name: 'trimesterId',
    required: false,
    description: 'Filter by trimester UUID',
    example: '770e8400-e29b-41d4-a716-446655440000',
  })
  @ApiResponse({
    status: 200,
    description: 'List of tests',
  })
  @ApiResponse({ status: 401, description: 'Unauthorized' })
  async getTestsByCourseClass(
    @Param('courseClassId') courseClassId: string,
    @Query('trimesterId') trimesterId?: string,
  ) {
    return this.getTestsByCourseClassUseCase.execute(courseClassId, trimesterId);
  }

  @Get(':id')
  @HttpCode(HttpStatus.OK)
  @ApiOperation({
    summary: 'Get a test by ID',
    description: 'Retrieve a specific test by its ID.',
  })
  @ApiParam({
    name: 'id',
    description: 'Test UUID',
    example: '880e8400-e29b-41d4-a716-446655440000',
  })
  @ApiResponse({
    status: 200,
    description: 'Test details',
  })
  @ApiResponse({ status: 401, description: 'Unauthorized' })
  @ApiResponse({ status: 404, description: 'Test not found' })
  async getTestById(@Param('id') id: string) {
    return this.getTestByIdUseCase.execute(id);
  }

  @Patch(':id')
  @HttpCode(HttpStatus.OK)
  @ApiOperation({
    summary: 'Update a test',
    description: 'Update test details.',
  })
  @ApiParam({
    name: 'id',
    description: 'Test UUID',
    example: '880e8400-e29b-41d4-a716-446655440000',
  })
  @ApiBody({ type: UpdateTestDto })
  @ApiResponse({
    status: 200,
    description: 'Test successfully updated',
  })
  @ApiResponse({ status: 401, description: 'Unauthorized' })
  @ApiResponse({ status: 404, description: 'Test not found' })
  async updateTest(
    @Param('id') id: string,
    @Body() request: UpdateTestDto,
  ) {
    return this.updateTestUseCase.execute(id, request);
  }

  @Delete(':id')
  @HttpCode(HttpStatus.OK)
  @ApiOperation({
    summary: 'Delete a test',
    description: 'Delete a test by ID.',
  })
  @ApiParam({
    name: 'id',
    description: 'Test UUID',
    example: '880e8400-e29b-41d4-a716-446655440000',
  })
  @ApiResponse({
    status: 200,
    description: 'Test successfully deleted',
    schema: {
      example: {
        message: 'Test deleted successfully',
      },
    },
  })
  @ApiResponse({ status: 401, description: 'Unauthorized' })
  @ApiResponse({ status: 404, description: 'Test not found' })
  async deleteTest(@Param('id') id: string) {
    return this.deleteTestUseCase.execute(id);
  }
}
