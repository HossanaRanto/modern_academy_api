import { Injectable, Inject, NotFoundException } from '@nestjs/common';
import type {
  ITrimesterRepository,
} from '../ports/trimester-repository.port';
import { TRIMESTER_REPOSITORY } from '../ports/trimester-repository.port';

@Injectable()
export class DeleteTrimesterUseCase {
  constructor(
    @Inject(TRIMESTER_REPOSITORY)
    private readonly trimesterRepository: ITrimesterRepository,
  ) {}

  async execute(id: string) {
    const trimester = await this.trimesterRepository.findById(id);

    if (!trimester) {
      throw new NotFoundException(`Trimester with ID ${id} not found`);
    }

    await this.trimesterRepository.delete(id);

    return { message: 'Trimester deleted successfully' };
  }
}
