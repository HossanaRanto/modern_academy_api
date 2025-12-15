import { Inject, Injectable, Logger } from '@nestjs/common';
import * as ClassPort from '../ports/class-repository.port';
import { ClassResponse } from '../../domain/class.interface';
import * as fs from 'fs';
import * as path from 'path';

interface DefaultClassData {
  name: string;
  code: string;
  level: number;
  description?: string;
  capacity?: number;
}

@Injectable()
export class SeedDefaultClassesUseCase {
  private readonly logger = new Logger(SeedDefaultClassesUseCase.name);

  constructor(
    @Inject(ClassPort.CLASS_REPOSITORY)
    private readonly classRepository: ClassPort.IClassRepository,
  ) {}

  async execute(academyId: string): Promise<{ created: ClassResponse[]; skipped: string[] }> {
    const defaultClassesPath = path.join(__dirname, '../../infrastructure/data/default-classes.json');
    
    let defaultClasses: DefaultClassData[];
    try {
      const fileContent = fs.readFileSync(defaultClassesPath, 'utf-8');
      defaultClasses = JSON.parse(fileContent);
    } catch (error) {
      this.logger.error('Failed to read default classes file', error);
      throw new Error('Failed to load default classes data');
    }

    const created: ClassResponse[] = [];
    const skipped: string[] = [];

    for (const classData of defaultClasses) {
      // Check if class already exists
      const existingClass = await this.classRepository.findByCode(classData.code);
      if (existingClass) {
        this.logger.log(`Skipping class ${classData.code} - already exists`);
        skipped.push(classData.code);
        continue;
      }

      // Create the class
      const classEntity = await this.classRepository.create({
        name: classData.name,
        code: classData.code,
        level: classData.level,
        description: classData.description,
        capacity: classData.capacity,
        isActive: true,
      });

      created.push({
        id: classEntity.id,
        name: classEntity.name,
        code: classEntity.code,
        level: classEntity.level,
        description: classEntity.description,
        capacity: classEntity.capacity,
        isActive: classEntity.isActive,
        createdAt: classEntity.createdAt,
        updatedAt: classEntity.updatedAt,
      });

      this.logger.log(`Created class: ${classData.name} (${classData.code})`);
    }

    return { created, skipped };
  }
}
