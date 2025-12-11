import { Controller, Post, Get, Body, UseGuards, Param } from '@nestjs/common';
import { CreateAcademyUseCase } from '../../application/use-cases/create-academy.use-case';
import { GetAcademyUseCase } from '../../application/use-cases/get-academy.use-case';
import { CreateAcademyDto } from '../dtos/create-academy.dto';
import { JwtAuthGuard } from '../../../../shared/guards/jwt-auth.guard';
import { CurrentUser } from '../../../../shared/decorators/current-user.decorator';
import type { CurrentUserPayload } from '../../../../shared/types/current-user.type';

@Controller('academies')
@UseGuards(JwtAuthGuard)
export class AcademyController {
  constructor(
    private readonly createAcademyUseCase: CreateAcademyUseCase,
    private readonly getAcademyUseCase: GetAcademyUseCase,
  ) {}

  @Post()
  async createAcademy(
    @Body() request: CreateAcademyDto,
    @CurrentUser() user: CurrentUserPayload,
  ) {
    return this.createAcademyUseCase.execute(request, user.userId);
  }

  @Get(':id')
  async getAcademy(@Param('id') id: string) {
    return this.getAcademyUseCase.execute(id);
  }
}
