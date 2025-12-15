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
} from '@nestjs/swagger';
import { CreateClassUseCase } from '../../application/use-cases/create-class.use-case';
import { GetClassesUseCase } from '../../application/use-cases/get-classes.use-case';
import { GetClassByIdUseCase } from '../../application/use-cases/get-class-by-id.use-case';
import { UpdateClassUseCase } from '../../application/use-cases/update-class.use-case';
import { DeleteClassUseCase } from '../../application/use-cases/delete-class.use-case';
import { CreateClassYearUseCase } from '../../application/use-cases/create-class-year.use-case';
import { GetClassYearsByAcademicYearUseCase } from '../../application/use-cases/get-class-years-by-academic-year.use-case';
import { UpdateClassYearUseCase } from '../../application/use-cases/update-class-year.use-case';
import { SeedDefaultClassesUseCase } from '../../application/use-cases/seed-default-classes.use-case';
import { CreateClassDto } from '../dtos/create-class.dto';
import { UpdateClassDto } from '../dtos/update-class.dto';
import { CreateClassYearDto } from '../dtos/create-class-year.dto';
import { UpdateClassYearDto } from '../dtos/update-class-year.dto';
import { JwtAuthGuard } from '../../../../shared/guards/jwt-auth.guard';
import { TenantGuard } from '../../../../shared/guards/tenant.guard';
import { TenantRequired } from '../../../../shared/decorators/tenant-required.decorator';
import { TenantId } from '../../../../shared/decorators/tenant-id.decorator';
import { CurrentAcademicYear } from '../../../../shared/decorators/current-academic-year.decorator';
import { RequireAcademicYear } from '../../../../shared/decorators/require-academic-year.decorator';
import { CacheInterceptor } from '../../../../shared/interceptors/cache.interceptor';
import { CacheKey, CacheTTL } from '../../../../shared/decorators/cache.decorator';

@ApiTags('Classes')
@ApiBearerAuth('JWT-auth')
@Controller('classes')
@UseGuards(JwtAuthGuard, TenantGuard)
@TenantRequired()
export class ClassController {
  constructor(
    private readonly createClassUseCase: CreateClassUseCase,
    private readonly getClassesUseCase: GetClassesUseCase,
    private readonly getClassByIdUseCase: GetClassByIdUseCase,
    private readonly updateClassUseCase: UpdateClassUseCase,
    private readonly deleteClassUseCase: DeleteClassUseCase,
    private readonly createClassYearUseCase: CreateClassYearUseCase,
    private readonly getClassYearsByAcademicYearUseCase: GetClassYearsByAcademicYearUseCase,
    private readonly updateClassYearUseCase: UpdateClassYearUseCase,
    private readonly seedDefaultClassesUseCase: SeedDefaultClassesUseCase,
  ) {}

  @Post()
  @HttpCode(HttpStatus.CREATED)
  @ApiOperation({ 
    summary: 'Create a new class',
    description: 'Create a new class for the academy.',
  })
  @ApiBody({ type: CreateClassDto })
  @ApiResponse({
    status: 201,
    description: 'Class successfully created',
    schema: {
      example: {
        id: '660e8400-e29b-41d4-a716-446655440000',
        name: 'Grade 1A',
        code: 'G1A',
        level: 1,
        description: 'First grade section A',
        capacity: 30,
        isActive: true,
        createdAt: '2025-12-15T10:00:00.000Z',
        updatedAt: '2025-12-15T10:00:00.000Z',
      },
    },
  })
  @ApiResponse({ status: 401, description: 'Unauthorized' })
  @ApiResponse({ status: 409, description: 'Class with this code already exists' })
  async createClass(
    @Body() request: CreateClassDto,
    @TenantId() academyId: string,
  ) {
    return this.createClassUseCase.execute(request, academyId);
  }

  @Get()
  @UseInterceptors(CacheInterceptor)
  @CacheKey('classes:all')
  @CacheTTL(300) // Cache for 5 minutes
  @ApiOperation({ 
    summary: 'Get all classes',
    description: 'Retrieve all classes for the academy.',
  })
  @ApiQuery({
    name: 'onlyActive',
    required: false,
    type: Boolean,
    description: 'Filter to only active classes',
    example: false,
  })
  @ApiResponse({
    status: 200,
    description: 'List of classes',
    schema: {
      example: [
        {
          id: '660e8400-e29b-41d4-a716-446655440000',
          name: 'Grade 1A',
          code: 'G1A',
          level: 1,
          description: 'First grade section A',
          capacity: 30,
          isActive: true,
          createdAt: '2025-12-15T10:00:00.000Z',
          updatedAt: '2025-12-15T10:00:00.000Z',
        },
      ],
    },
  })
  @ApiResponse({ status: 401, description: 'Unauthorized' })
  async getClasses(
    @TenantId() academyId: string,
    @Query('onlyActive', new DefaultValuePipe(false), ParseBoolPipe) onlyActive: boolean,
  ) {
    return this.getClassesUseCase.execute(academyId, onlyActive);
  }

  @Get(':id')
  @UseInterceptors(CacheInterceptor)
  @CacheKey('classes:id::id')
  @CacheTTL(600) // Cache for 10 minutes
  @ApiOperation({ 
    summary: 'Get class by ID',
    description: 'Retrieve a specific class by its ID.',
  })
  @ApiParam({ name: 'id', description: 'Class ID' })
  @ApiResponse({
    status: 200,
    description: 'Class details',
    schema: {
      example: {
        id: '660e8400-e29b-41d4-a716-446655440000',
        name: 'Grade 1A',
        code: 'G1A',
        level: 1,
        description: 'First grade section A',
        capacity: 30,
        isActive: true,
        createdAt: '2025-12-15T10:00:00.000Z',
        updatedAt: '2025-12-15T10:00:00.000Z',
      },
    },
  })
  @ApiResponse({ status: 401, description: 'Unauthorized' })
  @ApiResponse({ status: 404, description: 'Class not found' })
  async getClassById(@Param('id') id: string) {
    return this.getClassByIdUseCase.execute(id);
  }

  @Patch(':id')
  @ApiOperation({ 
    summary: 'Update class',
    description: 'Update an existing class.',
  })
  @ApiParam({ name: 'id', description: 'Class ID' })
  @ApiBody({ type: UpdateClassDto })
  @ApiResponse({
    status: 200,
    description: 'Class successfully updated',
  })
  @ApiResponse({ status: 401, description: 'Unauthorized' })
  @ApiResponse({ status: 404, description: 'Class not found' })
  @ApiResponse({ status: 409, description: 'Class with this code already exists' })
  async updateClass(
    @Param('id') id: string,
    @Body() request: UpdateClassDto,
  ) {
    return this.updateClassUseCase.execute(id, request);
  }

  @Delete(':id')
  @HttpCode(HttpStatus.NO_CONTENT)
  @ApiOperation({ 
    summary: 'Delete class',
    description: 'Delete a class.',
  })
  @ApiParam({ name: 'id', description: 'Class ID' })
  @ApiResponse({ status: 204, description: 'Class successfully deleted' })
  @ApiResponse({ status: 401, description: 'Unauthorized' })
  @ApiResponse({ status: 404, description: 'Class not found' })
  async deleteClass(@Param('id') id: string) {
    await this.deleteClassUseCase.execute(id);
  }

  // Class Year routes - uses current academic year
  
  @Post('years')
  @HttpCode(HttpStatus.CREATED)
  @RequireAcademicYear()
  @ApiOperation({ 
    summary: 'Create a class year',
    description: 'Create a class year for the current academic year. This associates a class with the current academic year.',
  })
  @ApiBody({ type: CreateClassYearDto })
  @ApiResponse({
    status: 201,
    description: 'Class year successfully created',
    schema: {
      example: {
        id: '660e8400-e29b-41d4-a716-446655440001',
        classId: '660e8400-e29b-41d4-a716-446655440000',
        academicYearId: '660e8400-e29b-41d4-a716-446655440002',
        section: 'A',
        roomNumber: 'Room 101',
        maxStudents: 30,
        isActive: true,
        createdAt: '2025-12-15T10:00:00.000Z',
        updatedAt: '2025-12-15T10:00:00.000Z',
      },
    },
  })
  @ApiResponse({ status: 401, description: 'Unauthorized' })
  @ApiResponse({ status: 404, description: 'Class or Academic Year not found' })
  @ApiResponse({ status: 409, description: 'Class year already exists' })
  async createClassYear(
    @Body() request: CreateClassYearDto,
    @CurrentAcademicYear() academicYearId: string,
  ) {
    return this.createClassYearUseCase.execute(request, academicYearId);
  }

  @Get('years/current')
  @UseInterceptors(CacheInterceptor)
  @CacheKey('classes:years:current')
  @CacheTTL(300) // Cache for 5 minutes
  @RequireAcademicYear()
  @ApiOperation({ 
    summary: 'Get class years for current academic year',
    description: 'Retrieve all class years for the current academic year.',
  })
  @ApiResponse({
    status: 200,
    description: 'List of class years',
  })
  @ApiResponse({ status: 401, description: 'Unauthorized' })
  async getClassYearsForCurrentYear(
    @CurrentAcademicYear() academicYearId: string,
  ) {
    return this.getClassYearsByAcademicYearUseCase.execute(academicYearId);
  }

  @Patch('years/:id')
  @RequireAcademicYear()
  @ApiOperation({ 
    summary: 'Update class year',
    description: 'Update an existing class year.',
  })
  @ApiParam({ name: 'id', description: 'Class Year ID' })
  @ApiBody({ type: UpdateClassYearDto })
  @ApiResponse({
    status: 200,
    description: 'Class year successfully updated',
  })
  @ApiResponse({ status: 401, description: 'Unauthorized' })
  @ApiResponse({ status: 404, description: 'Class year not found' })
  async updateClassYear(
    @Param('id') id: string,
    @Body() request: UpdateClassYearDto,
  ) {
    return this.updateClassYearUseCase.execute(id, request);
  }

  @Post('seed/defaults')
  @HttpCode(HttpStatus.CREATED)
  @RequireAcademicYear()
  @ApiOperation({ 
    summary: 'Seed default classes',
    description: 'Loads and creates default classes from JSON configuration and creates class years for the current academic year. Skips classes that already exist.',
  })
  @ApiResponse({
    status: 201,
    description: 'Default classes seeded successfully',
    schema: {
      example: {
        created: [
          {
            id: '660e8400-e29b-41d4-a716-446655440000',
            name: 'Grade 1',
            code: 'G1',
            level: 1,
            description: 'First grade elementary class',
            capacity: 30,
            isActive: true,
            createdAt: '2025-12-15T10:00:00.000Z',
            updatedAt: '2025-12-15T10:00:00.000Z',
          },
        ],
        skipped: ['G2', 'G3'],
      },
    },
  })
  @ApiResponse({ status: 401, description: 'Unauthorized' })
  async seedDefaultClasses(
    @CurrentAcademicYear() academicYearId: string,
  ) {
    return this.seedDefaultClassesUseCase.execute(academicYearId);
  }
}
