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
  childClassCode?: string;
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
    const classMap = new Map<string, any>(); // Map to store created classes by code

    // First pass: Create all classes without child relationships
    for (const classData of defaultClasses) {
      // Check if class already exists
      const existingClass = await this.classRepository.findByCode(classData.code);
      if (existingClass) {
        this.logger.log(`Skipping class ${classData.code} - already exists`);
        skipped.push(classData.code);
        classMap.set(classData.code, existingClass);
        continue;
      }

      // Create the class without childClassId first
      const classEntity = await this.classRepository.create({
        name: classData.name,
        code: classData.code,
        level: classData.level,
        description: classData.description,
        capacity: classData.capacity,
        isActive: true,
      });

      classMap.set(classData.code, classEntity);

      created.push({
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
      });

      this.logger.log(`Created class: ${classData.name} (${classData.code})`);
    }

    // Second pass: Update child class relationships
    for (const classData of defaultClasses) {
      if (classData.childClassCode && classMap.has(classData.code)) {
        const parentClass = classMap.get(classData.code);
        const childClass = classMap.get(classData.childClassCode);

        if (childClass && !parentClass.childClassId) {
          parentClass.childClassId = childClass.id;
          await this.classRepository.save(parentClass);
          
          // Update in the created array
          const createdIndex = created.findIndex(c => c.id === parentClass.id);
          if (createdIndex !== -1) {
            created[createdIndex].childClassId = childClass.id;
          }

          this.logger.log(`Linked ${classData.code} to child class ${classData.childClassCode}`);
        }
      }
    }

    return { created, skipped };
  }
}
