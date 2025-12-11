import { Inject, Injectable, ConflictException } from '@nestjs/common';
import * as AcademicYearPort from '../ports/academic-year-repository.port';

export interface CreateAcademicYearRequest {
  name: string;
  startDate: Date;
  endDate: Date;
}

@Injectable()
export class CreateAcademicYearUseCase {
  constructor(
    @Inject(AcademicYearPort.ACADEMIC_YEAR_REPOSITORY)
    private readonly academicYearRepository: AcademicYearPort.IAcademicYearRepository,
  ) {}

  async execute(academyId: string, dto: CreateAcademicYearRequest) {
    // Validate dates
    const startDate = new Date(dto.startDate);
    const endDate = new Date(dto.endDate);

    if (startDate >= endDate) {
      throw new ConflictException('Start date must be before end date');
    }

    // Check for overlapping academic years
    const existingYears = await this.academicYearRepository.findByAcademyId(academyId);
    const hasOverlap = existingYears.some(year => {
      const existingStart = new Date(year.startDate);
      const existingEnd = new Date(year.endDate);

      return (
        (startDate >= existingStart && startDate <= existingEnd) ||
        (endDate >= existingStart && endDate <= existingEnd) ||
        (startDate <= existingStart && endDate >= existingEnd)
      );
    });

    if (hasOverlap) {
      throw new ConflictException('Academic year dates overlap with an existing academic year');
    }

    // Set as current if it's the first one
    const isCurrent = existingYears.length === 0;

    return await this.academicYearRepository.create({
      name: dto.name,
      startDate,
      endDate,
      academyId,
      isCurrent,
      isActive: true,
    });
  }
}
