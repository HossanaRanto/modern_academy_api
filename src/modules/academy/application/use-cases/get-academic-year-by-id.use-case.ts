import { Inject, Injectable, NotFoundException } from '@nestjs/common';
import * as AcademicYearPort from '../ports/academic-year-repository.port';

@Injectable()
export class GetAcademicYearByIdUseCase {
  constructor(
    @Inject(AcademicYearPort.ACADEMIC_YEAR_REPOSITORY)
    private readonly academicYearRepository: AcademicYearPort.IAcademicYearRepository,
  ) {}

  async execute(academyId: string, yearId: string) {
    const academicYear = await this.academicYearRepository.findById(yearId);
    
    if (!academicYear) {
      throw new NotFoundException('Academic year not found');
    }

    if (academicYear.academyId !== academyId) {
      throw new NotFoundException('This academic year does not belong to your academy');
    }

    return academicYear;
  }
}
