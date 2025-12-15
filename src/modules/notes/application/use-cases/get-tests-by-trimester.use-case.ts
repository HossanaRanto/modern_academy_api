import { Injectable, Inject } from '@nestjs/common';
import type {
  ITestRepository,
} from '../ports/test-repository.port';
import { TEST_REPOSITORY } from '../ports/test-repository.port';

@Injectable()
export class GetTestsByTrimesterUseCase {
  constructor(
    @Inject(TEST_REPOSITORY)
    private readonly testRepository: ITestRepository,
  ) {}

  async execute(trimesterId: string) {
    return this.testRepository.findByTrimester(trimesterId);
  }
}
