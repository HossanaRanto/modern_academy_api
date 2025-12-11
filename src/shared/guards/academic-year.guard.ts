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

    // If not required and no header provided, just continue
    if (!isRequired && !academicYearId) {
      return true;
    }

    // If header provided, validate it
    if (academicYearId) {
      if (!user || !user.academyId) {
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

    // If required but not provided, try to get the current one
    if (isRequired) {
      if (!user || !user.academyId) {
        throw new ForbiddenException('User must belong to an academy');
      }

      const currentYear = await this.academicYearRepository.findOne({
        where: { 
          academyId: user.academyId,
          isCurrent: true,
        },
      });

      if (!currentYear) {
        throw new BadRequestException(
          'No current academic year found for your academy. Please provide X-Academic-Year-ID header or set a current academic year.',
        );
      }

      request.academicYearId = currentYear.id;
      request.academicYear = currentYear;
    }

    return true;
  }
}
