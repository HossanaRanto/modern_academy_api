import { Inject, Injectable } from '@nestjs/common';
import * as AcademicYearPort from '../ports/academic-year-repository.port';

@Injectable()
export class GetAcademicYearsUseCase {
  constructor(
    @Inject(AcademicYearPort.ACADEMIC_YEAR_REPOSITORY)
    private readonly academicYearRepository: AcademicYearPort.IAcademicYearRepository,
  ) {}

  async execute(academyId: string) {
    return await this.academicYearRepository.findByAcademyId(academyId);
  }
}
