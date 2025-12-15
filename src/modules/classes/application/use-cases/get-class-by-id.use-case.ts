import { Inject, Injectable, NotFoundException } from '@nestjs/common';
import * as ClassPort from '../ports/class-repository.port';
import { ClassResponse } from '../../domain/class.interface';

@Injectable()
export class GetClassByIdUseCase {
  constructor(
    @Inject(ClassPort.CLASS_REPOSITORY)
    private readonly classRepository: ClassPort.IClassRepository,
  ) {}

  async execute(id: string): Promise<ClassResponse> {
    const classEntity = await this.classRepository.findById(id);
    if (!classEntity) {
      throw new NotFoundException('Class not found');
    }

    return {
      id: classEntity.id,
      name: classEntity.name,
      code: classEntity.code,
      level: classEntity.level,
      description: classEntity.description,
      capacity: classEntity.capacity,
      isActive: classEntity.isActive,
      createdAt: classEntity.createdAt,
      updatedAt: classEntity.updatedAt,
    };
  }
}
