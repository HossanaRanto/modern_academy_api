import { 
  Controller, 
  Post, 
  Get, 
  Body, 
  UseGuards, 
  Param, 
  Patch,
  HttpCode, 
  HttpStatus,
  UseInterceptors,
  Res,
} from '@nestjs/common';
import type { Response } from 'express';
import { 
  ApiTags, 
  ApiOperation, 
  ApiResponse, 
  ApiBody, 
  ApiBearerAuth, 
  ApiParam,
  ApiSecurity,
} from '@nestjs/swagger';
import { RegisterStudentUseCase } from '../../application/use-cases/register-student.use-case';
import { GetStudentsByAcademicYearUseCase } from '../../application/use-cases/get-students-by-academic-year.use-case';
import { GetStudentByIdUseCase } from '../../application/use-cases/get-student-by-id.use-case';
import { UpdateStudentUseCase } from '../../application/use-cases/update-student.use-case';
import { GetInscriptionsByAcademicYearUseCase } from '../../application/use-cases/get-inscriptions-by-academic-year.use-case';
import { GetInscriptionsByClassYearUseCase } from '../../application/use-cases/get-inscriptions-by-class-year.use-case';
import { UpdateInscriptionUseCase } from '../../application/use-cases/update-inscription.use-case';
import { GenerateInscriptionPdfUseCase } from '../../application/use-cases/generate-inscription-pdf.use-case';
import { RegisterStudentDto } from '../dtos/register-student.dto';
import { UpdateStudentDto } from '../dtos/update-student.dto';
import { UpdateInscriptionDto } from '../dtos/update-inscription.dto';
import { JwtAuthGuard } from '../../../../shared/guards/jwt-auth.guard';
import { TenantGuard } from '../../../../shared/guards/tenant.guard';
import { TenantRequired } from '../../../../shared/decorators/tenant-required.decorator';
import { CurrentAcademicYear } from '../../../../shared/decorators/current-academic-year.decorator';
import { RequireAcademicYear } from '../../../../shared/decorators/require-academic-year.decorator';
import { CacheInterceptor } from '../../../../shared/interceptors/cache.interceptor';
import { CacheKey, CacheTTL } from '../../../../shared/decorators/cache.decorator';

@ApiTags('Students')
@ApiBearerAuth('JWT-auth')
@Controller('students')
@UseGuards(JwtAuthGuard, TenantGuard)
@TenantRequired()
export class StudentController {
  constructor(
    private readonly registerStudentUseCase: RegisterStudentUseCase,
    private readonly getStudentsByAcademicYearUseCase: GetStudentsByAcademicYearUseCase,
    private readonly getStudentByIdUseCase: GetStudentByIdUseCase,
    private readonly updateStudentUseCase: UpdateStudentUseCase,
    private readonly getInscriptionsByAcademicYearUseCase: GetInscriptionsByAcademicYearUseCase,
    private readonly getInscriptionsByClassYearUseCase: GetInscriptionsByClassYearUseCase,
    private readonly updateInscriptionUseCase: UpdateInscriptionUseCase,
    private readonly generateInscriptionPdfUseCase: GenerateInscriptionPdfUseCase,
  ) {}

  @Post('register')
  @HttpCode(HttpStatus.CREATED)
  @RequireAcademicYear()
  @ApiSecurity('AcademicYear')
  @ApiOperation({ 
    summary: 'Register a student',
    description: 'Register a student for the current academic year. Creates new student if registration number does not exist, otherwise updates existing student and creates new inscription.',
  })
  @ApiBody({ type: RegisterStudentDto })
  @ApiResponse({
    status: 201,
    description: 'Student successfully registered',
    schema: {
      example: {
        student: {
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
  @CacheTTL(300)
  @RequireAcademicYear()
  @ApiSecurity('AcademicYear')
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
  @CacheTTL(600)
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
    description: 'Update an existing student information.',
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

  @Get('inscriptions/academic-year/current')
  @UseInterceptors(CacheInterceptor)
  @CacheKey('students:inscriptions:academic-year:current')
  @CacheTTL(300)
  @RequireAcademicYear()
  @ApiSecurity('AcademicYear')
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
  @CacheTTL(300)
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

  @Get('inscriptions/:id/pdf')
  @HttpCode(HttpStatus.OK)
  @ApiOperation({ 
    summary: 'Generate inscription form PDF',
    description: 'Generate a PDF document for a student inscription form'
  })
  @ApiParam({ name: 'id', description: 'Inscription ID' })
  @ApiResponse({ 
    status: 200, 
    description: 'PDF generated successfully',
    content: {
      'application/pdf': {
        schema: {
          type: 'string',
          format: 'binary',
        },
      },
    },
  })
  @ApiResponse({ status: 401, description: 'Unauthorized' })
  @ApiResponse({ status: 404, description: 'Inscription not found' })
  async generateInscriptionPdf(
    @Param('id') id: string,
    @Res() res: Response,
  ) {
    // TODO: Get academy info from current user/tenant context
    const pdfBuffer = await this.generateInscriptionPdfUseCase.execute({
      inscriptionId: id,
      academyName: 'Modern Academy',
      academyAddress: '123 Education Street, City, Country',
      academyPhone: '+1 234 567 8900',
      academyEmail: 'info@modernacademy.com',
    });

    res.set({
      'Content-Type': 'application/pdf',
      'Content-Disposition': `attachment; filename=inscription-${id}.pdf`,
      'Content-Length': pdfBuffer.length,
    });

    res.send(pdfBuffer);
  }
}
