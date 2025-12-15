import { Inject, Injectable } from '@nestjs/common';
import * as ClassPort from '../ports/class-repository.port';
import { ClassResponse } from '../../domain/class.interface';

@Injectable()
export class GetClassesUseCase {
  constructor(
    @Inject(ClassPort.CLASS_REPOSITORY)
    private readonly classRepository: ClassPort.IClassRepository,
  ) {}

  async execute(academyId: string, onlyActive: boolean = false): Promise<ClassResponse[]> {
    const classes = onlyActive 
      ? await this.classRepository.findAllActive(academyId)
      : await this.classRepository.findAll(academyId);

    return classes.map(classEntity => ({
      id: classEntity.id,
      name: classEntity.name,
      code: classEntity.code,
      level: classEntity.level,
      description: classEntity.description,
      capacity: classEntity.capacity,
      isActive: classEntity.isActive,
      createdAt: classEntity.createdAt,
      updatedAt: classEntity.updatedAt,
    }));
  }
}
