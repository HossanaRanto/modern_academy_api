import { Injectable, Inject, NotFoundException } from '@nestjs/common';
import type {
  ITestRepository,
} from '../ports/test-repository.port';
import { TEST_REPOSITORY } from '../ports/test-repository.port';
import type {
  ITrimesterRepository,
} from '../ports/trimester-repository.port';
import { TRIMESTER_REPOSITORY } from '../ports/trimester-repository.port';
import { CreateTestDto } from '../../infrastructure/dtos/create-test.dto';

@Injectable()
export class CreateTestUseCase {
  constructor(
    @Inject(TEST_REPOSITORY)
    private readonly testRepository: ITestRepository,
    @Inject(TRIMESTER_REPOSITORY)
    private readonly trimesterRepository: ITrimesterRepository,
  ) {}

  async execute(request: CreateTestDto) {
    // Verify trimester exists
    const trimester = await this.trimesterRepository.findById(
      request.trimesterId,
    );

    if (!trimester) {
      throw new NotFoundException(
        `Trimester with ID ${request.trimesterId} not found`,
      );
    }

    const test = await this.testRepository.create(request);

    return test;
  }
}
