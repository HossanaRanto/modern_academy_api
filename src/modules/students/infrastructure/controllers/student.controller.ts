import { Controller, Post, Get, Body, UseGuards, Param, Delete, Put } from '@nestjs/common';
import { ApiTags, ApiOperation, ApiResponse, ApiBearerAuth, ApiParam } from '@nestjs/swagger';
import { CreateStudentUseCase } from '../../application/use-cases/create-student.use-case';
import { GetAllStudentsUseCase } from '../../application/use-cases/get-all-students.use-case';
import { CreateStudentDto } from '../dtos/create-student.dto';
import { JwtAuthGuard } from '../../../../shared/guards/jwt-auth.guard';
import { TenantGuard } from '../../../../shared/guards/tenant.guard';
import { TenantRequired } from '../../../../shared/decorators/tenant-required.decorator';
import { TenantId } from '../../../../shared/decorators/tenant-id.decorator';

@ApiTags('Students (Tenant-Specific)')
@ApiBearerAuth()
@Controller('students')
@UseGuards(JwtAuthGuard, TenantGuard)
@TenantRequired()
export class StudentController {
  constructor(
    private readonly createStudentUseCase: CreateStudentUseCase,
    private readonly getAllStudentsUseCase: GetAllStudentsUseCase,
  ) {}

  @Post()
  @ApiOperation({ 
    summary: 'Create a new student',
    description: `Creates a new student record. Note: After creation, you must create a StudentInscription 
    to enroll the student in an AcademicYear, which links them to your academy.`
  })
  @ApiResponse({ status: 201, description: 'Student created successfully' })
  @ApiResponse({ status: 401, description: 'Unauthorized' })
  @ApiResponse({ status: 403, description: 'Forbidden - User not associated with an academy' })
  async createStudent(
    @Body() request: CreateStudentDto,
    @TenantId() tenantId: string,
  ) {
    return this.createStudentUseCase.execute(request, tenantId);
  }

  @Get()
  @ApiOperation({ 
    summary: 'Get all students enrolled in your academy',
    description: `Retrieves all students who have inscriptions (enrollments) in any academic year 
    belonging to your academy. Students are linked to academies through: Student → StudentInscription → AcademicYear → Academy`
  })
  @ApiResponse({ status: 200, description: 'Students retrieved successfully' })
  @ApiResponse({ status: 401, description: 'Unauthorized' })
  @ApiResponse({ status: 403, description: 'Forbidden - User not associated with an academy' })
  async getAllStudents(@TenantId() tenantId: string) {
    return this.getAllStudentsUseCase.execute(tenantId);
  }

  @Get(':id')
  @ApiOperation({ 
    summary: 'Get student by ID',
    description: 'Retrieves a specific student. Can only access students from your academy.'
  })
  @ApiParam({ name: 'id', description: 'Student ID' })
  @ApiResponse({ status: 200, description: 'Student retrieved successfully' })
  @ApiResponse({ status: 401, description: 'Unauthorized' })
  @ApiResponse({ status: 403, description: 'Forbidden - Student belongs to different academy' })
  @ApiResponse({ status: 404, description: 'Student not found' })
  async getStudent(
    @Param('id') id: string,
    @TenantId() tenantId: string,
  ) {
    // Implementation for get single student
    return { message: 'Get student by ID - to be implemented', id, tenantId };
  }
}
