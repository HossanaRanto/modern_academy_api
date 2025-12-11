import { Controller, Post, Get, Body, UseGuards, Param, Patch, HttpCode, HttpStatus } from '@nestjs/common';
import { ApiTags, ApiOperation, ApiResponse, ApiBody, ApiBearerAuth, ApiParam, ApiHeader } from '@nestjs/swagger';
import { CreateAcademyUseCase } from '../../application/use-cases/create-academy.use-case';
import { GetAcademyUseCase } from '../../application/use-cases/get-academy.use-case';
import { CreateAcademicYearUseCase } from '../../application/use-cases/create-academic-year.use-case';
import { GetAcademicYearsUseCase } from '../../application/use-cases/get-academic-years.use-case';
import { GetAcademicYearByIdUseCase } from '../../application/use-cases/get-academic-year-by-id.use-case';
import { SetCurrentAcademicYearUseCase } from '../../application/use-cases/set-current-academic-year.use-case';
import { CreateAcademyDto } from '../dtos/create-academy.dto';
import { CreateAcademicYearDto } from '../dtos/create-academic-year.dto';
import { JwtAuthGuard } from '../../../../shared/guards/jwt-auth.guard';
import { TenantGuard } from '../../../../shared/guards/tenant.guard';
import { CurrentUser } from '../../../../shared/decorators/current-user.decorator';
import { TenantId } from '../../../../shared/decorators/tenant-id.decorator';
import { TenantRequired } from '../../../../shared/decorators/tenant-required.decorator';
import type { CurrentUserPayload } from '../../../../shared/types/current-user.type';

@ApiTags('Academies')
@ApiBearerAuth('JWT-auth')
@Controller('academies')
@UseGuards(JwtAuthGuard)
export class AcademyController {
  constructor(
    private readonly createAcademyUseCase: CreateAcademyUseCase,
    private readonly getAcademyUseCase: GetAcademyUseCase,
    private readonly createAcademicYearUseCase: CreateAcademicYearUseCase,
    private readonly getAcademicYearsUseCase: GetAcademicYearsUseCase,
    private readonly getAcademicYearByIdUseCase: GetAcademicYearByIdUseCase,
    private readonly setCurrentAcademicYearUseCase: SetCurrentAcademicYearUseCase,
  ) {}

  @Post()
  @ApiOperation({ 
    summary: 'Create a new academy',
    description: 'Create a new academy and link it to the authenticated user. User must not already have an academy.',
  })
  @ApiBody({ type: CreateAcademyDto })
  @ApiResponse({
    status: 201,
    description: 'Academy successfully created',
    schema: {
      example: {
        id: '660e8400-e29b-41d4-a716-446655440000',
        name: 'Modern Academy',
        code: 'MA001',
        address: '123 Main Street, City',
        phone: '+1234567890',
        email: 'info@modernacademy.com',
        logo: null,
        isActive: true,
        createdAt: '2025-12-11T10:00:00.000Z',
        updatedAt: '2025-12-11T10:00:00.000Z',
      },
    },
  })
  @ApiResponse({
    status: 401,
    description: 'Unauthorized - Invalid or missing JWT token',
  })
  @ApiResponse({
    status: 409,
    description: 'Conflict - Academy with this code already exists or user already has an academy',
  })
  @ApiResponse({
    status: 404,
    description: 'User not found',
  })
  async createAcademy(
    @Body() request: CreateAcademyDto,
    @CurrentUser() user: CurrentUserPayload,
  ) {
    return this.createAcademyUseCase.execute(request, user.userId);
  }

  // Academic Year Management - These routes MUST come before the :id route

  @Post('academic-years')
  @UseGuards(TenantGuard)
  @TenantRequired()
  @HttpCode(HttpStatus.CREATED)
  @ApiOperation({
    summary: 'Create a new academic year',
    description: 'Creates a new academic year for your academy. Validates date ranges and prevents overlapping periods.',
  })
  @ApiBody({ type: CreateAcademicYearDto })
  @ApiResponse({
    status: 201,
    description: 'Academic year created successfully',
    schema: {
      example: {
        id: '660e8400-e29b-41d4-a716-446655440001',
        name: '2024-2025',
        startDate: '2024-09-01',
        endDate: '2025-06-30',
        isCurrent: false,
        isActive: true,
        academyId: '660e8400-e29b-41d4-a716-446655440000',
        createdAt: '2025-12-11T10:00:00.000Z',
        updatedAt: '2025-12-11T10:00:00.000Z',
      },
    },
  })
  @ApiResponse({
    status: 400,
    description: 'Bad request - Invalid dates or overlapping academic year',
  })
  @ApiResponse({
    status: 401,
    description: 'Unauthorized',
  })
  @ApiResponse({
    status: 403,
    description: 'Forbidden - User not associated with an academy',
  })
  async createAcademicYear(
    @Body() dto: CreateAcademicYearDto,
    @TenantId() tenantId: string,
  ) {
    return this.createAcademicYearUseCase.execute(tenantId, dto);
  }

  @Get('academic-years')
  @UseGuards(TenantGuard)
  @TenantRequired()
  @ApiOperation({
    summary: 'Get all academic years',
    description: 'Retrieves all academic years for your academy, ordered by start date (most recent first).',
  })
  @ApiResponse({
    status: 200,
    description: 'Academic years retrieved successfully',
    schema: {
      example: [
        {
          id: '660e8400-e29b-41d4-a716-446655440001',
          name: '2024-2025',
          startDate: '2024-09-01',
          endDate: '2025-06-30',
          isCurrent: true,
          isActive: true,
          academyId: '660e8400-e29b-41d4-a716-446655440000',
          createdAt: '2025-12-11T10:00:00.000Z',
          updatedAt: '2025-12-11T10:00:00.000Z',
        },
      ],
    },
  })
  @ApiResponse({
    status: 401,
    description: 'Unauthorized',
  })
  @ApiResponse({
    status: 403,
    description: 'Forbidden - User not associated with an academy',
  })
  async getAcademicYears(@TenantId() tenantId: string) {
    console.log("tenant ",tenantId);
    
    return this.getAcademicYearsUseCase.execute(tenantId);
  }

  @Get('academic-years/:yearId')
  @UseGuards(TenantGuard)
  @TenantRequired()
  @ApiOperation({
    summary: 'Get academic year by ID',
    description: 'Retrieves a specific academic year by ID. Must belong to your academy.',
  })
  @ApiParam({
    name: 'yearId',
    description: 'Academic Year ID',
    type: String,
  })
  @ApiResponse({
    status: 200,
    description: 'Academic year retrieved successfully',
  })
  @ApiResponse({
    status: 401,
    description: 'Unauthorized',
  })
  @ApiResponse({
    status: 403,
    description: 'Forbidden',
  })
  @ApiResponse({
    status: 404,
    description: 'Academic year not found',
  })
  async getAcademicYear(
    @Param('yearId') yearId: string,
    @TenantId() tenantId: string,
  ) {
    return this.getAcademicYearByIdUseCase.execute(tenantId, yearId);
  }

  @Patch('academic-years/:yearId/set-current')
  @UseGuards(TenantGuard)
  @TenantRequired()
  @HttpCode(HttpStatus.OK)
  @ApiOperation({
    summary: 'Set as current academic year',
    description: 'Sets the specified academic year as the current/active one for your academy. Only one academic year can be current at a time.',
  })
  @ApiParam({
    name: 'yearId',
    description: 'Academic Year ID to set as current',
    type: String,
  })
  @ApiResponse({
    status: 200,
    description: 'Academic year set as current successfully',
  })
  @ApiResponse({
    status: 401,
    description: 'Unauthorized',
  })
  @ApiResponse({
    status: 403,
    description: 'Forbidden',
  })
  @ApiResponse({
    status: 404,
    description: 'Academic year not found',
  })
  async setCurrentAcademicYear(
    @Param('yearId') yearId: string,
    @TenantId() tenantId: string,
  ) {
    return this.setCurrentAcademicYearUseCase.execute(tenantId, yearId);
  }

  // This parameterized route MUST come LAST to avoid conflicts

  @Get(':id')
  @ApiOperation({ 
    summary: 'Get academy by ID',
    description: 'Retrieve detailed information about a specific academy',
  })
  @ApiParam({
    name: 'id',
    description: 'Academy UUID',
    example: '660e8400-e29b-41d4-a716-446655440000',
  })
  @ApiResponse({
    status: 200,
    description: 'Academy found',
    schema: {
      example: {
        id: '660e8400-e29b-41d4-a716-446655440000',
        name: 'Modern Academy',
        code: 'MA001',
        address: '123 Main Street, City',
        phone: '+1234567890',
        email: 'info@modernacademy.com',
        logo: null,
        isActive: true,
        createdAt: '2025-12-11T10:00:00.000Z',
        updatedAt: '2025-12-11T10:00:00.000Z',
      },
    },
  })
  @ApiResponse({
    status: 401,
    description: 'Unauthorized - Invalid or missing JWT token',
  })
  @ApiResponse({
    status: 404,
    description: 'Academy not found',
  })
  async getAcademy(@Param('id') id: string) {
    return this.getAcademyUseCase.execute(id);
  }
}
