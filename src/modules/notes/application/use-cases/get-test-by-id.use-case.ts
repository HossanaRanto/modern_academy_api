import { Injectable, Inject, NotFoundException } from '@nestjs/common';
import type {
  ITestRepository,
} from '../ports/test-repository.port';
import { TEST_REPOSITORY } from '../ports/test-repository.port';

@Injectable()
export class GetTestByIdUseCase {
  constructor(
    @Inject(TEST_REPOSITORY)
    private readonly testRepository: ITestRepository,
  ) {}

  async execute(id: string) {
    const test = await this.testRepository.findById(id);

    if (!test) {
      throw new NotFoundException(`Test with ID ${id} not found`);
    }

    return test;
  }
}
