import { Inject, Injectable, NotFoundException } from '@nestjs/common';
import * as ClassYearPort from '../ports/class-year-repository.port';
import { UpdateClassYearRequest, ClassYearResponse } from '../../domain/class.interface';

@Injectable()
export class UpdateClassYearUseCase {
  constructor(
    @Inject(ClassYearPort.CLASS_YEAR_REPOSITORY)
    private readonly classYearRepository: ClassYearPort.IClassYearRepository,
  ) {}

  async execute(id: string, request: UpdateClassYearRequest): Promise<ClassYearResponse> {
    const classYear = await this.classYearRepository.findById(id);
    if (!classYear) {
      throw new NotFoundException('Class year not found');
    }

    // Update fields
    if (request.section !== undefined) classYear.section = request.section;
    if (request.roomNumber !== undefined) classYear.roomNumber = request.roomNumber;
    if (request.maxStudents !== undefined) classYear.maxStudents = request.maxStudents;
    if (request.isActive !== undefined) classYear.isActive = request.isActive;

    const saved = await this.classYearRepository.save(classYear);

    return {
      id: saved.id,
      classId: saved.classId,
      academicYearId: saved.academicYearId,
      section: saved.section,
      roomNumber: saved.roomNumber,
      maxStudents: saved.maxStudents,
      isActive: saved.isActive,
      createdAt: saved.createdAt,
      updatedAt: saved.updatedAt,
    };
  }
}
