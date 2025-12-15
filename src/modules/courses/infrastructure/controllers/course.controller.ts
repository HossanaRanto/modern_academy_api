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
  ParseBoolPipe,
  DefaultValuePipe,
  UseInterceptors,
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
import { CreateCourseUseCase } from '../../application/use-cases/create-course.use-case';
import { GetCoursesUseCase } from '../../application/use-cases/get-courses.use-case';
import { GetCourseByIdUseCase } from '../../application/use-cases/get-course-by-id.use-case';
import { UpdateCourseUseCase } from '../../application/use-cases/update-course.use-case';
import { DeleteCourseUseCase } from '../../application/use-cases/delete-course.use-case';
import { CreateCourseClassUseCase } from '../../application/use-cases/create-course-class.use-case';
import { GetCourseClassesByClassYearUseCase } from '../../application/use-cases/get-course-classes-by-class-year.use-case';
import { UpdateCourseClassUseCase } from '../../application/use-cases/update-course-class.use-case';
import { SeedDefaultCoursesUseCase } from '../../application/use-cases/seed-default-courses.use-case';
import { CreateCourseDto } from '../dtos/create-course.dto';
import { UpdateCourseDto } from '../dtos/update-course.dto';
import { CreateCourseClassDto } from '../dtos/create-course-class.dto';
import { UpdateCourseClassDto } from '../dtos/update-course-class.dto';
import { JwtAuthGuard } from '../../../../shared/guards/jwt-auth.guard';
import { TenantGuard } from '../../../../shared/guards/tenant.guard';
import { TenantRequired } from '../../../../shared/decorators/tenant-required.decorator';
import { TenantId } from '../../../../shared/decorators/tenant-id.decorator';
import { CurrentAcademicYear } from '../../../../shared/decorators/current-academic-year.decorator';
import { RequireAcademicYear } from '../../../../shared/decorators/require-academic-year.decorator';
import { CacheInterceptor } from '../../../../shared/interceptors/cache.interceptor';
import { CacheKey, CacheTTL } from '../../../../shared/decorators/cache.decorator';

@ApiTags('Courses')
@ApiBearerAuth('JWT-auth')
@Controller('courses')
@UseGuards(JwtAuthGuard, TenantGuard)
@TenantRequired()
export class CourseController {
  constructor(
    private readonly createCourseUseCase: CreateCourseUseCase,
    private readonly getCoursesUseCase: GetCoursesUseCase,
    private readonly getCourseByIdUseCase: GetCourseByIdUseCase,
    private readonly updateCourseUseCase: UpdateCourseUseCase,
    private readonly deleteCourseUseCase: DeleteCourseUseCase,
    private readonly createCourseClassUseCase: CreateCourseClassUseCase,
    private readonly getCourseClassesByClassYearUseCase: GetCourseClassesByClassYearUseCase,
    private readonly updateCourseClassUseCase: UpdateCourseClassUseCase,
    private readonly seedDefaultCoursesUseCase: SeedDefaultCoursesUseCase,
  ) {}

  @Post()
  @HttpCode(HttpStatus.CREATED)
  @ApiOperation({ 
    summary: 'Create a new course',
    description: 'Create a new course for the academy.',
  })
  @ApiBody({ type: CreateCourseDto })
  @ApiResponse({
    status: 201,
    description: 'Course successfully created',
    schema: {
      example: {
        id: '660e8400-e29b-41d4-a716-446655440000',
        name: 'Mathematics',
        code: 'MATH101',
        description: 'Introduction to Mathematics',
        coefficient: 2,
        category: 'Sciences',
        isActive: true,
        createdAt: '2025-12-15T10:00:00.000Z',
        updatedAt: '2025-12-15T10:00:00.000Z',
      },
    },
  })
  @ApiResponse({ status: 401, description: 'Unauthorized' })
  @ApiResponse({ status: 409, description: 'Course with this code already exists' })
  async createCourse(
    @Body() request: CreateCourseDto,
    @TenantId() academyId: string,
  ) {
    return this.createCourseUseCase.execute(request, academyId);
  }

  @Get()
  @UseInterceptors(CacheInterceptor)
  @CacheKey('courses:all')
  @CacheTTL(300) // Cache for 5 minutes
  @ApiOperation({ 
    summary: 'Get all courses',
    description: 'Retrieve all courses for the academy. Optionally filter by active status or category.',
  })
  @ApiQuery({
    name: 'onlyActive',
    required: false,
    type: Boolean,
    description: 'Filter to only active courses',
    example: false,
  })
  @ApiQuery({
    name: 'category',
    required: false,
    type: String,
    description: 'Filter courses by category',
    example: 'Sciences',
  })
  @ApiResponse({
    status: 200,
    description: 'List of courses',
    schema: {
      example: [
        {
          id: '660e8400-e29b-41d4-a716-446655440000',
          name: 'Mathematics',
          code: 'MATH101',
          description: 'Introduction to Mathematics',
          coefficient: 2,
          category: 'Sciences',
          isActive: true,
          createdAt: '2025-12-15T10:00:00.000Z',
          updatedAt: '2025-12-15T10:00:00.000Z',
        },
      ],
    },
  })
  @ApiResponse({ status: 401, description: 'Unauthorized' })
  async getCourses(
    @TenantId() academyId: string,
    @Query('onlyActive', new DefaultValuePipe(false), ParseBoolPipe) onlyActive: boolean,
    @Query('category') category?: string,
  ) {
    return this.getCoursesUseCase.execute(academyId, onlyActive, category);
  }

  @Get(':id')
  @UseInterceptors(CacheInterceptor)
  @CacheKey('courses:id::id')
  @CacheTTL(600) // Cache for 10 minutes
  @ApiOperation({ 
    summary: 'Get course by ID',
    description: 'Retrieve a specific course by its ID.',
  })
  @ApiParam({ name: 'id', description: 'Course ID' })
  @ApiResponse({
    status: 200,
    description: 'Course details',
    schema: {
      example: {
        id: '660e8400-e29b-41d4-a716-446655440000',
        name: 'Mathematics',
        code: 'MATH101',
        description: 'Introduction to Mathematics',
        coefficient: 2,
        category: 'Sciences',
        isActive: true,
        createdAt: '2025-12-15T10:00:00.000Z',
        updatedAt: '2025-12-15T10:00:00.000Z',
      },
    },
  })
  @ApiResponse({ status: 401, description: 'Unauthorized' })
  @ApiResponse({ status: 404, description: 'Course not found' })
  async getCourseById(@Param('id') id: string) {
    return this.getCourseByIdUseCase.execute(id);
  }

  @Patch(':id')
  @ApiOperation({ 
    summary: 'Update course',
    description: 'Update an existing course.',
  })
  @ApiParam({ name: 'id', description: 'Course ID' })
  @ApiBody({ type: UpdateCourseDto })
  @ApiResponse({
    status: 200,
    description: 'Course successfully updated',
  })
  @ApiResponse({ status: 401, description: 'Unauthorized' })
  @ApiResponse({ status: 404, description: 'Course not found' })
  @ApiResponse({ status: 409, description: 'Course with this code already exists' })
  async updateCourse(
    @Param('id') id: string,
    @Body() request: UpdateCourseDto,
  ) {
    return this.updateCourseUseCase.execute(id, request);
  }

  @Delete(':id')
  @HttpCode(HttpStatus.NO_CONTENT)
  @ApiOperation({ 
    summary: 'Delete course',
    description: 'Delete a course.',
  })
  @ApiParam({ name: 'id', description: 'Course ID' })
  @ApiResponse({ status: 204, description: 'Course successfully deleted' })
  @ApiResponse({ status: 401, description: 'Unauthorized' })
  @ApiResponse({ status: 404, description: 'Course not found' })
  async deleteCourse(@Param('id') id: string) {
    await this.deleteCourseUseCase.execute(id);
  }

  // Course Class routes
  
  @Post('classes')
  @HttpCode(HttpStatus.CREATED)
  @ApiOperation({ 
    summary: 'Create a course class',
    description: 'Associate a course with a class year (which includes the academic year).',
  })
  @ApiBody({ type: CreateCourseClassDto })
  @ApiResponse({
    status: 201,
    description: 'Course class successfully created',
    schema: {
      example: {
        id: '660e8400-e29b-41d4-a716-446655440003',
        courseId: '660e8400-e29b-41d4-a716-446655440000',
        classYearId: '660e8400-e29b-41d4-a716-446655440001',
        teacherId: '660e8400-e29b-41d4-a716-446655440002',
        hoursPerWeek: 4,
        coefficient: 2,
        isActive: true,
        createdAt: '2025-12-15T10:00:00.000Z',
        updatedAt: '2025-12-15T10:00:00.000Z',
      },
    },
  })
  @ApiResponse({ status: 401, description: 'Unauthorized' })
  @ApiResponse({ status: 404, description: 'Course or Class Year not found' })
  @ApiResponse({ status: 409, description: 'Course class already exists' })
  async createCourseClass(
    @Body() request: CreateCourseClassDto,
  ) {
    return this.createCourseClassUseCase.execute(request);
  }

  @Get('classes/class-year/:classYearId')
  @UseInterceptors(CacheInterceptor)
  @CacheKey('courses:classes:class-year::classYearId')
  @CacheTTL(300) // Cache for 5 minutes
  @ApiOperation({ 
    summary: 'Get course classes by class year',
    description: 'Retrieve all course classes for a specific class year.',
  })
  @ApiParam({ name: 'classYearId', description: 'Class Year ID' })
  @ApiResponse({
    status: 200,
    description: 'List of course classes',
  })
  @ApiResponse({ status: 401, description: 'Unauthorized' })
  async getCourseClassesByClassYear(
    @Param('classYearId') classYearId: string,
  ) {
    return this.getCourseClassesByClassYearUseCase.execute(classYearId);
  }

  @Patch('classes/:id')
  @ApiOperation({ 
    summary: 'Update course class',
    description: 'Update an existing course class.',
  })
  @ApiParam({ name: 'id', description: 'Course Class ID' })
  @ApiBody({ type: UpdateCourseClassDto })
  @ApiResponse({
    status: 200,
    description: 'Course class successfully updated',
  })
  @ApiResponse({ status: 401, description: 'Unauthorized' })
  @ApiResponse({ status: 404, description: 'Course class not found' })
  async updateCourseClass(
    @Param('id') id: string,
    @Body() request: UpdateCourseClassDto,
  ) {
    return this.updateCourseClassUseCase.execute(id, request);
  }

  @Post('seed/defaults')
  @HttpCode(HttpStatus.CREATED)
  @RequireAcademicYear()
  @ApiSecurity('AcademicYear')
  @ApiOperation({ 
    summary: 'Seed default courses',
    description: 'Loads and creates default courses from JSON configuration, mapped to class names. Creates course classes for the current academic year. Requires that classes and class years exist.',
  })
  @ApiResponse({
    status: 201,
    description: 'Default courses seeded successfully',
    schema: {
      example: {
        courses: {
          created: [
            {
              id: '660e8400-e29b-41d4-a716-446655440000',
              name: 'Mathematics',
              code: 'G1-MATH',
              description: 'Basic arithmetic and problem solving',
              coefficient: 3,
              category: 'Mathematics',
              isActive: true,
              createdAt: '2025-12-15T10:00:00.000Z',
              updatedAt: '2025-12-15T10:00:00.000Z',
            },
          ],
          skipped: ['G2-MATH'],
        },
        courseClasses: {
          created: [
            {
              id: '660e8400-e29b-41d4-a716-446655440001',
              courseId: '660e8400-e29b-41d4-a716-446655440000',
              classYearId: '660e8400-e29b-41d4-a716-446655440002',
              coefficient: 3,
              isActive: true,
              createdAt: '2025-12-15T10:00:00.000Z',
              updatedAt: '2025-12-15T10:00:00.000Z',
            },
          ],
          skipped: [],
          errors: [],
        },
      },
    },
  })
  @ApiResponse({ status: 401, description: 'Unauthorized' })
  async seedDefaultCourses(
    @TenantId() academyId: string,
    @CurrentAcademicYear() academicYearId: string,
  ) {
    return this.seedDefaultCoursesUseCase.execute(academyId, academicYearId);
  }
}
