import { Injectable, Inject, NotFoundException } from '@nestjs/common';
import type {
  ITestRepository,
} from '../ports/test-repository.port';
import { TEST_REPOSITORY } from '../ports/test-repository.port';
import { UpdateTestDto } from '../../infrastructure/dtos/update-test.dto';

@Injectable()
export class UpdateTestUseCase {
  constructor(
    @Inject(TEST_REPOSITORY)
    private readonly testRepository: ITestRepository,
  ) {}

  async execute(id: string, request: UpdateTestDto) {
    const test = await this.testRepository.findById(id);

    if (!test) {
      throw new NotFoundException(`Test with ID ${id} not found`);
    }

    Object.assign(test, request);

    return this.testRepository.save(test);
  }
}
