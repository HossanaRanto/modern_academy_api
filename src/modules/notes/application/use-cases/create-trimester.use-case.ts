import { Injectable, Inject, ConflictException } from '@nestjs/common';
import type {
  ITrimesterRepository,
} from '../ports/trimester-repository.port';
import { TRIMESTER_REPOSITORY } from '../ports/trimester-repository.port';
import { CreateTrimesterDto } from '../../infrastructure/dtos/create-trimester.dto';

@Injectable()
export class CreateTrimesterUseCase {
  constructor(
    @Inject(TRIMESTER_REPOSITORY)
    private readonly trimesterRepository: ITrimesterRepository,
  ) {}

  async execute(
    request: CreateTrimesterDto,
    academicYearId: string,
  ) {
    // Check if a trimester with the same order already exists
    const existingTrimesters = await this.trimesterRepository.findByAcademicYear(
      academicYearId,
    );

    const orderExists = existingTrimesters.some(
      (t) => t.order === request.order,
    );

    if (orderExists) {
      throw new ConflictException(
        `A trimester with order ${request.order} already exists for this academic year`,
      );
    }

    // Validate dates
    if (request.startDate >= request.endDate) {
      throw new ConflictException('Start date must be before end date');
    }

    const trimester = await this.trimesterRepository.create({
      ...request,
      academicYearId,
    });

    return trimester;
  }
}
