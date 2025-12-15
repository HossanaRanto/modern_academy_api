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
import { CreateTrimesterUseCase } from '../../application/use-cases/create-trimester.use-case';
import { GetTrimestersByAcademicYearUseCase } from '../../application/use-cases/get-trimesters-by-academic-year.use-case';
import { GetTrimesterByIdUseCase } from '../../application/use-cases/get-trimester-by-id.use-case';
import { UpdateTrimesterUseCase } from '../../application/use-cases/update-trimester.use-case';
import { DeleteTrimesterUseCase } from '../../application/use-cases/delete-trimester.use-case';
import { CreateTrimesterDto } from '../dtos/create-trimester.dto';
import { UpdateTrimesterDto } from '../dtos/update-trimester.dto';
import { JwtAuthGuard } from '../../../../shared/guards/jwt-auth.guard';
import { TenantGuard } from '../../../../shared/guards/tenant.guard';
import { AcademicYearGuard } from '../../../../shared/guards/academic-year.guard';
import { TenantRequired } from '../../../../shared/decorators/tenant-required.decorator';
import { RequireAcademicYear } from '../../../../shared/decorators/require-academic-year.decorator';
import { CurrentAcademicYear } from '../../../../shared/decorators/current-academic-year.decorator';

@ApiTags('Trimesters')
@ApiBearerAuth('JWT-auth')
@Controller('trimesters')
@UseGuards(JwtAuthGuard, TenantGuard, AcademicYearGuard)
@TenantRequired()
@RequireAcademicYear()
export class TrimesterController {
  constructor(
    private readonly createTrimesterUseCase: CreateTrimesterUseCase,
    private readonly getTrimestersByAcademicYearUseCase: GetTrimestersByAcademicYearUseCase,
    private readonly getTrimesterByIdUseCase: GetTrimesterByIdUseCase,
    private readonly updateTrimesterUseCase: UpdateTrimesterUseCase,
    private readonly deleteTrimesterUseCase: DeleteTrimesterUseCase,
  ) {}

  @Post()
  @HttpCode(HttpStatus.CREATED)
  @ApiSecurity('AcademicYear')
  @ApiOperation({
    summary: 'Create a new trimester',
    description: 'Create a new trimester for the current academic year.',
  })
  @ApiBody({ type: CreateTrimesterDto })
  @ApiResponse({
    status: 201,
    description: 'Trimester successfully created',
    schema: {
      example: {
        id: '770e8400-e29b-41d4-a716-446655440000',
        name: 'First Trimester',
        order: 1,
        startDate: '2025-09-01',
        endDate: '2025-12-15',
        percentage: 33.33,
        academicYearId: '660e8400-e29b-41d4-a716-446655440000',
        isActive: true,
        createdAt: '2025-12-15T10:00:00.000Z',
        updatedAt: '2025-12-15T10:00:00.000Z',
      },
    },
  })
  @ApiResponse({ status: 401, description: 'Unauthorized' })
  @ApiResponse({ status: 409, description: 'Trimester with this order already exists' })
  async createTrimester(
    @Body() request: CreateTrimesterDto,
    @CurrentAcademicYear() academicYearId: string,
  ) {
    return this.createTrimesterUseCase.execute(request, academicYearId);
  }

  @Get()
  @HttpCode(HttpStatus.OK)
  @ApiSecurity('AcademicYear')
  @ApiOperation({
    summary: 'Get all trimesters for current academic year',
    description: 'Retrieve all trimesters for the current academic year.',
  })
  @ApiQuery({
    name: 'activeOnly',
    required: false,
    type: Boolean,
    description: 'Filter only active trimesters',
  })
  @ApiResponse({
    status: 200,
    description: 'List of trimesters',
    schema: {
      example: [
        {
          id: '770e8400-e29b-41d4-a716-446655440000',
          name: 'First Trimester',
          order: 1,
          startDate: '2025-09-01',
          endDate: '2025-12-15',
          percentage: 33.33,
          academicYearId: '660e8400-e29b-41d4-a716-446655440000',
          isActive: true,
          createdAt: '2025-12-15T10:00:00.000Z',
          updatedAt: '2025-12-15T10:00:00.000Z',
        },
      ],
    },
  })
  @ApiResponse({ status: 401, description: 'Unauthorized' })
  async getTrimesters(
    @CurrentAcademicYear() academicYearId: string,
    @Query('activeOnly', new DefaultValuePipe(false), ParseBoolPipe)
    activeOnly: boolean,
  ) {
    return this.getTrimestersByAcademicYearUseCase.execute(
      academicYearId,
      activeOnly,
    );
  }

  @Get(':id')
  @HttpCode(HttpStatus.OK)
  @ApiSecurity('AcademicYear')
  @ApiOperation({
    summary: 'Get a trimester by ID',
    description: 'Retrieve a specific trimester by its ID.',
  })
  @ApiParam({
    name: 'id',
    description: 'Trimester UUID',
    example: '770e8400-e29b-41d4-a716-446655440000',
  })
  @ApiResponse({
    status: 200,
    description: 'Trimester details',
    schema: {
      example: {
        id: '770e8400-e29b-41d4-a716-446655440000',
        name: 'First Trimester',
        order: 1,
        startDate: '2025-09-01',
        endDate: '2025-12-15',
        percentage: 33.33,
        academicYearId: '660e8400-e29b-41d4-a716-446655440000',
        isActive: true,
        createdAt: '2025-12-15T10:00:00.000Z',
        updatedAt: '2025-12-15T10:00:00.000Z',
      },
    },
  })
  @ApiResponse({ status: 401, description: 'Unauthorized' })
  @ApiResponse({ status: 404, description: 'Trimester not found' })
  async getTrimesterById(@Param('id') id: string) {
    return this.getTrimesterByIdUseCase.execute(id);
  }

  @Patch(':id')
  @HttpCode(HttpStatus.OK)
  @ApiSecurity('AcademicYear')
  @ApiOperation({
    summary: 'Update a trimester',
    description: 'Update trimester details.',
  })
  @ApiParam({
    name: 'id',
    description: 'Trimester UUID',
    example: '770e8400-e29b-41d4-a716-446655440000',
  })
  @ApiBody({ type: UpdateTrimesterDto })
  @ApiResponse({
    status: 200,
    description: 'Trimester successfully updated',
  })
  @ApiResponse({ status: 401, description: 'Unauthorized' })
  @ApiResponse({ status: 404, description: 'Trimester not found' })
  @ApiResponse({ status: 409, description: 'Order conflict' })
  async updateTrimester(
    @Param('id') id: string,
    @Body() request: UpdateTrimesterDto,
  ) {
    return this.updateTrimesterUseCase.execute(id, request);
  }

  @Delete(':id')
  @HttpCode(HttpStatus.OK)
  @ApiSecurity('AcademicYear')
  @ApiOperation({
    summary: 'Delete a trimester',
    description: 'Delete a trimester by ID.',
  })
  @ApiParam({
    name: 'id',
    description: 'Trimester UUID',
    example: '770e8400-e29b-41d4-a716-446655440000',
  })
  @ApiResponse({
    status: 200,
    description: 'Trimester successfully deleted',
    schema: {
      example: {
        message: 'Trimester deleted successfully',
      },
    },
  })
  @ApiResponse({ status: 401, description: 'Unauthorized' })
  @ApiResponse({ status: 404, description: 'Trimester not found' })
  async deleteTrimester(@Param('id') id: string) {
    return this.deleteTrimesterUseCase.execute(id);
  }
}
