import { Controller, Post, Get, Body, UseGuards, Param } from '@nestjs/common';
import { ApiTags, ApiOperation, ApiResponse, ApiBody, ApiBearerAuth, ApiParam } from '@nestjs/swagger';
import { CreateAcademyUseCase } from '../../application/use-cases/create-academy.use-case';
import { GetAcademyUseCase } from '../../application/use-cases/get-academy.use-case';
import { CreateAcademyDto } from '../dtos/create-academy.dto';
import { JwtAuthGuard } from '../../../../shared/guards/jwt-auth.guard';
import { CurrentUser } from '../../../../shared/decorators/current-user.decorator';
import type { CurrentUserPayload } from '../../../../shared/types/current-user.type';

@ApiTags('Academies')
@ApiBearerAuth('JWT-auth')
@Controller('academies')
@UseGuards(JwtAuthGuard)
export class AcademyController {
  constructor(
    private readonly createAcademyUseCase: CreateAcademyUseCase,
    private readonly getAcademyUseCase: GetAcademyUseCase,
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
