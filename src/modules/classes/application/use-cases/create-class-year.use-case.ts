import { Inject, Injectable, NotFoundException, ConflictException } from '@nestjs/common';
import * as ClassYearPort from '../ports/class-year-repository.port';
import * as ClassPort from '../ports/class-repository.port';
import { CreateClassYearRequest, ClassYearResponse } from '../../domain/class.interface';

@Injectable()
export class CreateClassYearUseCase {
  constructor(
    @Inject(ClassYearPort.CLASS_YEAR_REPOSITORY)
    private readonly classYearRepository: ClassYearPort.IClassYearRepository,
    @Inject(ClassPort.CLASS_REPOSITORY)
    private readonly classRepository: ClassPort.IClassRepository,
  ) {}

  async execute(request: CreateClassYearRequest, academicYearId: string): Promise<ClassYearResponse> {
    // Verify class exists
    const classEntity = await this.classRepository.findById(request.classId);
    if (!classEntity) {
      throw new NotFoundException('Class not found');
    }

    // Check if class year already exists for this class and academic year
    const existingClassYear = await this.classYearRepository.findByClassAndAcademicYear(
      request.classId,
      academicYearId,
    );
    if (existingClassYear) {
      throw new ConflictException('Class year already exists for this class and academic year');
    }

    // Create class year
    const classYear = await this.classYearRepository.create({
      classId: request.classId,
      academicYearId,
      section: request.section,
      roomNumber: request.roomNumber,
      maxStudents: request.maxStudents,
      isActive: true,
    });

    return {
      id: classYear.id,
      classId: classYear.classId,
      academicYearId: classYear.academicYearId,
      section: classYear.section,
      roomNumber: classYear.roomNumber,
      maxStudents: classYear.maxStudents,
      isActive: classYear.isActive,
      createdAt: classYear.createdAt,
      updatedAt: classYear.updatedAt,
    };
  }
}
