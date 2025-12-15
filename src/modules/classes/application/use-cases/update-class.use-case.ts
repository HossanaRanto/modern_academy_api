import { Inject, Injectable, NotFoundException, ConflictException } from '@nestjs/common';
import * as ClassPort from '../ports/class-repository.port';
import { UpdateClassRequest, ClassResponse } from '../../domain/class.interface';

@Injectable()
export class UpdateClassUseCase {
  constructor(
    @Inject(ClassPort.CLASS_REPOSITORY)
    private readonly classRepository: ClassPort.IClassRepository,
  ) {}

  async execute(id: string, request: UpdateClassRequest): Promise<ClassResponse> {
    const classEntity = await this.classRepository.findById(id);
    if (!classEntity) {
      throw new NotFoundException('Class not found');
    }

    // Check if code is being changed and if it conflicts
    if (request.code && request.code !== classEntity.code) {
      const existingClass = await this.classRepository.findByCode(request.code);
      if (existingClass) {
        throw new ConflictException('Class with this code already exists');
      }
    }

    // Validate child class if provided
    if (request.childClassId !== undefined) {
      if (request.childClassId) {
        const childClass = await this.classRepository.findById(request.childClassId);
        if (!childClass) {
          throw new ConflictException('Child class not found');
        }
      }
      classEntity.childClassId = request.childClassId;
    }

    // Update fields
    if (request.name !== undefined) classEntity.name = request.name;
    if (request.code !== undefined) classEntity.code = request.code;
    if (request.level !== undefined) classEntity.level = request.level;
    if (request.description !== undefined) classEntity.description = request.description;
    if (request.capacity !== undefined) classEntity.capacity = request.capacity;
    if (request.isActive !== undefined) classEntity.isActive = request.isActive;

    const saved = await this.classRepository.save(classEntity);

    return {
      id: saved.id,
      name: saved.name,
      code: saved.code,
      level: saved.level,
      description: saved.description,
      capacity: saved.capacity,
      childClassId: saved.childClassId,
      isActive: saved.isActive,
      createdAt: saved.createdAt,
      updatedAt: saved.updatedAt,
    };
  }
}
