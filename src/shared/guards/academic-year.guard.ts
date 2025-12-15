import {
  Injectable,
  CanActivate,
  ExecutionContext,
  BadRequestException,
  ForbiddenException,
} from '@nestjs/common';
import { Reflector } from '@nestjs/core';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { AcademicYear } from '../../entities/academic-year.entity';
import { ACADEMIC_YEAR_REQUIRED_KEY } from '../decorators/require-academic-year.decorator';

@Injectable()
export class AcademicYearGuard implements CanActivate {
  constructor(
    @InjectRepository(AcademicYear)
    private readonly academicYearRepository: Repository<AcademicYear>,
    private reflector: Reflector,
  ) {}

  async canActivate(context: ExecutionContext): Promise<boolean> {
    const isRequired = this.reflector.getAllAndOverride<boolean>(
      ACADEMIC_YEAR_REQUIRED_KEY,
      [context.getHandler(), context.getClass()],
    );

    const request = context.switchToHttp().getRequest();
    const user = request.user;
    const academicYearId = request.headers['x-academic-year-id'];

    // If user is not authenticated yet, skip this guard
    // (JwtAuthGuard will handle authentication)
    if (!user) {
      return true;
    }

    // If required but header not provided, throw BadRequest immediately
    if (isRequired && !academicYearId) {
      throw new BadRequestException(
        'Academic year is required. Please provide x-academic-year-id header.',
      );
    }

    // If not required and no header provided, just continue
    if (!isRequired && !academicYearId) {
      return true;
    }

    // If header provided, validate it
    if (academicYearId) {
      // Validate UUID format
      const uuidRegex = /^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/i;
      if (!uuidRegex.test(academicYearId)) {
        throw new BadRequestException('Invalid academic year ID format. Must be a valid UUID.');
      }

      if (!user.academyId) {
        throw new ForbiddenException('User must belong to an academy');
      }

      const academicYear = await this.academicYearRepository.findOne({
        where: { id: academicYearId },
      });

      if (!academicYear) {
        throw new BadRequestException('Academic year not found');
      }

      if (academicYear.academyId !== user.academyId) {
        throw new ForbiddenException(
          'This academic year does not belong to your academy',
        );
      }

      // Attach to request for use in controllers
      request.academicYearId = academicYearId;
      request.academicYear = academicYear;
      return true;
    }

    return true;
  }
}
