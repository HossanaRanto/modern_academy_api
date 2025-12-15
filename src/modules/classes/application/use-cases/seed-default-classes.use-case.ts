import { Inject, Injectable, Logger } from '@nestjs/common';
import * as ClassPort from '../ports/class-repository.port';
import * as ClassYearPort from '../ports/class-year-repository.port';
import { ClassResponse } from '../../domain/class.interface';

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
    @Inject(ClassYearPort.CLASS_YEAR_REPOSITORY)
    private readonly classYearRepository: ClassYearPort.IClassYearRepository,
  ) {}

  async execute(academicYearId: string): Promise<{ created: ClassResponse[]; skipped: string[] }> {
    let defaultClasses: DefaultClassData[];
    try {
      // Use require which works with both src and dist folders
      defaultClasses = require('../../infrastructure/data/default-classes.json');
    } catch (error) {
      this.logger.error('Failed to load default classes data', error);
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
        
        // Create class year if it doesn't exist for this academic year
        const existingClassYear = await this.classYearRepository.findByClassAndAcademicYear(
          existingClass.id,
          academicYearId,
        );
        
        if (!existingClassYear) {
          await this.classYearRepository.create({
            classId: existingClass.id,
            academicYearId: academicYearId,
            maxStudents: existingClass.capacity || 30,
            isActive: true,
          });
          this.logger.log(`Created class year for existing class: ${classData.code}`);
        }
        
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

      // Create class year for the new class
      await this.classYearRepository.create({
        classId: classEntity.id,
        academicYearId: academicYearId,
        maxStudents: classData.capacity || 30,
        isActive: true,
      });

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

      this.logger.log(`Created class: ${classData.name} (${classData.code}) with class year`);
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
