import { Injectable, Inject } from '@nestjs/common';
import type {
  ITrimesterRepository,
} from '../ports/trimester-repository.port';
import { TRIMESTER_REPOSITORY } from '../ports/trimester-repository.port';

@Injectable()
export class GetTrimestersByAcademicYearUseCase {
  constructor(
    @Inject(TRIMESTER_REPOSITORY)
    private readonly trimesterRepository: ITrimesterRepository,
  ) {}

  async execute(academicYearId: string, activeOnly: boolean = false) {
    if (activeOnly) {
      return this.trimesterRepository.findActiveByAcademicYear(academicYearId);
    }
    return this.trimesterRepository.findByAcademicYear(academicYearId);
  }
}
