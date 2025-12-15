import { Injectable, Inject } from '@nestjs/common';
import type {
  ITestRepository,
} from '../ports/test-repository.port';
import { TEST_REPOSITORY } from '../ports/test-repository.port';

@Injectable()
export class GetTestsByCourseClassUseCase {
  constructor(
    @Inject(TEST_REPOSITORY)
    private readonly testRepository: ITestRepository,
  ) {}

  async execute(courseClassId: string, trimesterId?: string) {
    if (trimesterId) {
      return this.testRepository.findByCourseClassAndTrimester(
        courseClassId,
        trimesterId,
      );
    }
    return this.testRepository.findByCourseClass(courseClassId);
  }
}
