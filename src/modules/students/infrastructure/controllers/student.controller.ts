import { import { Controller, Post, Get, Body, UseGuards, Param, Delete, Put } from '@nestjs/common';

  Controller, import { ApiTags, ApiOperation, ApiResponse, ApiBearerAuth, ApiParam } from '@nestjs/swagger';

  Post, import { CreateStudentUseCase } from '../../application/use-cases/create-student.use-case';

  Get, import { GetAllStudentsUseCase } from '../../application/use-cases/get-all-students.use-case';

  Body, import { CreateStudentDto } from '../dtos/create-student.dto';

  UseGuards, import { JwtAuthGuard } from '../../../../shared/guards/jwt-auth.guard';

  Param, import { TenantGuard } from '../../../../shared/guards/tenant.guard';

  Patch,import { TenantRequired } from '../../../../shared/decorators/tenant-required.decorator';

  HttpCode, import { TenantId } from '../../../../shared/decorators/tenant-id.decorator';

  HttpStatus,

  UseInterceptors,@ApiTags('Students (Tenant-Specific)')

} from '@nestjs/common';@ApiBearerAuth()

import { @Controller('students')

  ApiTags, @UseGuards(JwtAuthGuard, TenantGuard)

  ApiOperation, @TenantRequired()

  ApiResponse, export class StudentController {

  ApiBody,   constructor(

  ApiBearerAuth,     private readonly createStudentUseCase: CreateStudentUseCase,

  ApiParam,    private readonly getAllStudentsUseCase: GetAllStudentsUseCase,

} from '@nestjs/swagger';  ) {}

import { RegisterStudentUseCase } from '../../application/use-cases/register-student.use-case';

import { GetStudentsByAcademicYearUseCase } from '../../application/use-cases/get-students-by-academic-year.use-case';  @Post()

import { GetStudentByIdUseCase } from '../../application/use-cases/get-student-by-id.use-case';  @ApiOperation({ 

import { UpdateStudentUseCase } from '../../application/use-cases/update-student.use-case';    summary: 'Create a new student',

import { GetInscriptionsByAcademicYearUseCase } from '../../application/use-cases/get-inscriptions-by-academic-year.use-case';    description: `Creates a new student record. Note: After creation, you must create a StudentInscription 

import { GetInscriptionsByClassYearUseCase } from '../../application/use-cases/get-inscriptions-by-class-year.use-case';    to enroll the student in an AcademicYear, which links them to your academy.`

import { UpdateInscriptionUseCase } from '../../application/use-cases/update-inscription.use-case';  })

import { RegisterStudentDto } from '../dtos/register-student.dto';  @ApiResponse({ status: 201, description: 'Student created successfully' })

import { UpdateStudentDto } from '../dtos/update-student.dto';  @ApiResponse({ status: 401, description: 'Unauthorized' })

import { UpdateInscriptionDto } from '../dtos/update-inscription.dto';  @ApiResponse({ status: 403, description: 'Forbidden - User not associated with an academy' })

import { JwtAuthGuard } from '../../../../shared/guards/jwt-auth.guard';  async createStudent(

import { TenantGuard } from '../../../../shared/guards/tenant.guard';    @Body() request: CreateStudentDto,

import { TenantRequired } from '../../../../shared/decorators/tenant-required.decorator';    @TenantId() tenantId: string,

import { CurrentAcademicYear } from '../../../../shared/decorators/current-academic-year.decorator';  ) {

import { RequireAcademicYear } from '../../../../shared/decorators/require-academic-year.decorator';    return this.createStudentUseCase.execute(request, tenantId);

import { CacheInterceptor } from '../../../../shared/interceptors/cache.interceptor';  }

import { CacheKey, CacheTTL } from '../../../../shared/decorators/cache.decorator';

  @Get()

@ApiTags('Students')  @ApiOperation({ 

@ApiBearerAuth('JWT-auth')    summary: 'Get all students enrolled in your academy',

@Controller('students')    description: `Retrieves all students who have inscriptions (enrollments) in any academic year 

@UseGuards(JwtAuthGuard, TenantGuard)    belonging to your academy. Students are linked to academies through: Student → StudentInscription → AcademicYear → Academy`

@TenantRequired()  })

export class StudentController {  @ApiResponse({ status: 200, description: 'Students retrieved successfully' })

  constructor(  @ApiResponse({ status: 401, description: 'Unauthorized' })

    private readonly registerStudentUseCase: RegisterStudentUseCase,  @ApiResponse({ status: 403, description: 'Forbidden - User not associated with an academy' })

    private readonly getStudentsByAcademicYearUseCase: GetStudentsByAcademicYearUseCase,  async getAllStudents(@TenantId() tenantId: string) {

    private readonly getStudentByIdUseCase: GetStudentByIdUseCase,    return this.getAllStudentsUseCase.execute(tenantId);

    private readonly updateStudentUseCase: UpdateStudentUseCase,  }

    private readonly getInscriptionsByAcademicYearUseCase: GetInscriptionsByAcademicYearUseCase,

    private readonly getInscriptionsByClassYearUseCase: GetInscriptionsByClassYearUseCase,  @Get(':id')

    private readonly updateInscriptionUseCase: UpdateInscriptionUseCase,  @ApiOperation({ 

  ) {}    summary: 'Get student by ID',

    description: 'Retrieves a specific student. Can only access students from your academy.'

  @Post('register')  })

  @HttpCode(HttpStatus.CREATED)  @ApiParam({ name: 'id', description: 'Student ID' })

  @RequireAcademicYear()  @ApiResponse({ status: 200, description: 'Student retrieved successfully' })

  @ApiOperation({   @ApiResponse({ status: 401, description: 'Unauthorized' })

    summary: 'Register a student',  @ApiResponse({ status: 403, description: 'Forbidden - Student belongs to different academy' })

    description: 'Register a student for the current academic year. Creates new student if registration number does not exist, otherwise updates existing student and creates new inscription.',  @ApiResponse({ status: 404, description: 'Student not found' })

  })  async getStudent(

  @ApiBody({ type: RegisterStudentDto })    @Param('id') id: string,

  @ApiResponse({    @TenantId() tenantId: string,

    status: 201,  ) {

    description: 'Student successfully registered',    // Implementation for get single student

    schema: {    return { message: 'Get student by ID - to be implemented', id, tenantId };

      example: {  }

        student: {}

          id: '660e8400-e29b-41d4-a716-446655440000',
          firstName: 'John',
          lastName: 'Doe',
          registrationNumber: 'STU2025001',
          dateOfBirth: '2010-05-15',
          gender: 'male',
          isActive: true,
        },
        inscription: {
          id: '660e8400-e29b-41d4-a716-446655440001',
          studentId: '660e8400-e29b-41d4-a716-446655440000',
          classYearId: '660e8400-e29b-41d4-a716-446655440002',
          status: 'confirmed',
          tuitionFee: 5000,
          isPaid: false,
        },
        isNewStudent: true,
      },
    },
  })
  @ApiResponse({ status: 401, description: 'Unauthorized' })
  @ApiResponse({ status: 409, description: 'Student already registered for this academic year' })
  async registerStudent(
    @Body() request: RegisterStudentDto,
    @CurrentAcademicYear() academicYearId: string,
  ) {
    return this.registerStudentUseCase.execute(request, academicYearId);
  }

  @Get('academic-year/current')
  @UseInterceptors(CacheInterceptor)
  @CacheKey('students:academic-year:current')
  @CacheTTL(300) // Cache for 5 minutes
  @RequireAcademicYear()
  @ApiOperation({ 
    summary: 'Get students by current academic year',
    description: 'Retrieve all students registered for the current academic year.',
  })
  @ApiResponse({
    status: 200,
    description: 'List of students',
  })
  @ApiResponse({ status: 401, description: 'Unauthorized' })
  async getStudentsByCurrentAcademicYear(
    @CurrentAcademicYear() academicYearId: string,
  ) {
    return this.getStudentsByAcademicYearUseCase.execute(academicYearId);
  }

  @Get(':id')
  @UseInterceptors(CacheInterceptor)
  @CacheKey('students:id::id')
  @CacheTTL(600) // Cache for 10 minutes
  @ApiOperation({ 
    summary: 'Get student by ID',
    description: 'Retrieve a specific student by ID.',
  })
  @ApiParam({ name: 'id', description: 'Student ID' })
  @ApiResponse({
    status: 200,
    description: 'Student details',
  })
  @ApiResponse({ status: 401, description: 'Unauthorized' })
  @ApiResponse({ status: 404, description: 'Student not found' })
  async getStudentById(@Param('id') id: string) {
    return this.getStudentByIdUseCase.execute(id);
  }

  @Patch(':id')
  @ApiOperation({ 
    summary: 'Update student',
    description: 'Update an existing student\'s information.',
  })
  @ApiParam({ name: 'id', description: 'Student ID' })
  @ApiBody({ type: UpdateStudentDto })
  @ApiResponse({
    status: 200,
    description: 'Student successfully updated',
  })
  @ApiResponse({ status: 401, description: 'Unauthorized' })
  @ApiResponse({ status: 404, description: 'Student not found' })
  async updateStudent(
    @Param('id') id: string,
    @Body() request: UpdateStudentDto,
  ) {
    return this.updateStudentUseCase.execute(id, request);
  }

  // Inscription routes

  @Get('inscriptions/academic-year/current')
  @UseInterceptors(CacheInterceptor)
  @CacheKey('students:inscriptions:academic-year:current')
  @CacheTTL(300) // Cache for 5 minutes
  @RequireAcademicYear()
  @ApiOperation({ 
    summary: 'Get inscriptions by current academic year',
    description: 'Retrieve all student inscriptions for the current academic year.',
  })
  @ApiResponse({
    status: 200,
    description: 'List of inscriptions',
  })
  @ApiResponse({ status: 401, description: 'Unauthorized' })
  async getInscriptionsByCurrentAcademicYear(
    @CurrentAcademicYear() academicYearId: string,
  ) {
    return this.getInscriptionsByAcademicYearUseCase.execute(academicYearId);
  }

  @Get('inscriptions/class-year/:classYearId')
  @UseInterceptors(CacheInterceptor)
  @CacheKey('students:inscriptions:class-year::classYearId')
  @CacheTTL(300) // Cache for 5 minutes
  @ApiOperation({ 
    summary: 'Get inscriptions by class year',
    description: 'Retrieve all student inscriptions for a specific class year.',
  })
  @ApiParam({ name: 'classYearId', description: 'Class Year ID' })
  @ApiResponse({
    status: 200,
    description: 'List of inscriptions',
  })
  @ApiResponse({ status: 401, description: 'Unauthorized' })
  async getInscriptionsByClassYear(
    @Param('classYearId') classYearId: string,
  ) {
    return this.getInscriptionsByClassYearUseCase.execute(classYearId);
  }

  @Patch('inscriptions/:id')
  @ApiOperation({ 
    summary: 'Update inscription',
    description: 'Update an existing student inscription (status, payment, etc.).',
  })
  @ApiParam({ name: 'id', description: 'Inscription ID' })
  @ApiBody({ type: UpdateInscriptionDto })
  @ApiResponse({
    status: 200,
    description: 'Inscription successfully updated',
  })
  @ApiResponse({ status: 401, description: 'Unauthorized' })
  @ApiResponse({ status: 404, description: 'Inscription not found' })
  async updateInscription(
    @Param('id') id: string,
    @Body() request: UpdateInscriptionDto,
  ) {
    return this.updateInscriptionUseCase.execute(id, request);
  }
}
