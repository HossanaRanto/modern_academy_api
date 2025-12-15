import { Injectable, Inject, NotFoundException, ConflictException } from '@nestjs/common';
import type {
  ITrimesterRepository,
} from '../ports/trimester-repository.port';
import { TRIMESTER_REPOSITORY } from '../ports/trimester-repository.port';
import { UpdateTrimesterDto } from '../../infrastructure/dtos/update-trimester.dto';

@Injectable()
export class UpdateTrimesterUseCase {
  constructor(
    @Inject(TRIMESTER_REPOSITORY)
    private readonly trimesterRepository: ITrimesterRepository,
  ) {}

  async execute(id: string, request: UpdateTrimesterDto) {
    const trimester = await this.trimesterRepository.findById(id);

    if (!trimester) {
      throw new NotFoundException(`Trimester with ID ${id} not found`);
    }

    // Check if order change conflicts with existing trimesters
    if (request.order && request.order !== trimester.order) {
      const existingTrimesters = await this.trimesterRepository.findByAcademicYear(
        trimester.academicYearId,
      );

      const orderExists = existingTrimesters.some(
        (t) => t.id !== id && t.order === request.order,
      );

      if (orderExists) {
        throw new ConflictException(
          `A trimester with order ${request.order} already exists for this academic year`,
        );
      }
    }

    // Validate dates if both are provided or one is being updated
    const startDate = request.startDate || trimester.startDate;
    const endDate = request.endDate || trimester.endDate;

    if (startDate >= endDate) {
      throw new ConflictException('Start date must be before end date');
    }

    Object.assign(trimester, request);

    return this.trimesterRepository.save(trimester);
  }
}
