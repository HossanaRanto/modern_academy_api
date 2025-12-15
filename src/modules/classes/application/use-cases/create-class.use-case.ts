import { Inject, Injectable, ConflictException } from '@nestjs/common';
import * as ClassPort from '../ports/class-repository.port';
import { CreateClassRequest, ClassResponse } from '../../domain/class.interface';

@Injectable()
export class CreateClassUseCase {
  constructor(
    @Inject(ClassPort.CLASS_REPOSITORY)
    private readonly classRepository: ClassPort.IClassRepository,
  ) {}

  async execute(request: CreateClassRequest, academyId: string): Promise<ClassResponse> {
    // Check if class with the same code already exists
    const existingClass = await this.classRepository.findByCode(request.code);
    if (existingClass) {
      throw new ConflictException('Class with this code already exists');
    }

    // Validate child class if provided
    if (request.childClassId) {
      const childClass = await this.classRepository.findById(request.childClassId);
      if (!childClass) {
        throw new ConflictException('Child class not found');
      }
    }

    // Create class
    const classEntity = await this.classRepository.create({
      name: request.name,
      code: request.code,
      level: request.level,
      description: request.description,
      capacity: request.capacity,
      childClassId: request.childClassId,
      isActive: true,
    });

    return {
      id: classEntity.id,
      name: classEntity.name,
      code: classEntity.code,
      level: classEntity.level,
      description: classEntity.description,
      capacity: classEntity.capacity,
      childClassId: classEntity.childClassId,
      isActive: classEntity.isActive,
      createdAt: classEntity.createdAt,
      updatedAt: classEntity.updatedAt,
    };
  }
}
