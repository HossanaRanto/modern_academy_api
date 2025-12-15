import { Inject, Injectable, NotFoundException } from '@nestjs/common';
import * as ClassPort from '../ports/class-repository.port';

@Injectable()
export class DeleteClassUseCase {
  constructor(
    @Inject(ClassPort.CLASS_REPOSITORY)
    private readonly classRepository: ClassPort.IClassRepository,
  ) {}

  async execute(id: string): Promise<void> {
    const classEntity = await this.classRepository.findById(id);
    if (!classEntity) {
      throw new NotFoundException('Class not found');
    }

    await this.classRepository.delete(id);
  }
}
