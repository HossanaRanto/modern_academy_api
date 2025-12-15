import { Inject, Injectable } from '@nestjs/common';
import * as ClassYearPort from '../ports/class-year-repository.port';
import { ClassYearResponse } from '../../domain/class.interface';

@Injectable()
export class GetClassYearsByAcademicYearUseCase {
  constructor(
    @Inject(ClassYearPort.CLASS_YEAR_REPOSITORY)
    private readonly classYearRepository: ClassYearPort.IClassYearRepository,
  ) {}

  async execute(academicYearId: string): Promise<ClassYearResponse[]> {
    const classYears = await this.classYearRepository.findByAcademicYear(academicYearId);

    return classYears.map(cy => ({
      id: cy.id,
      classId: cy.classId,
      academicYearId: cy.academicYearId,
      section: cy.section,
      roomNumber: cy.roomNumber,
      maxStudents: cy.maxStudents,
      isActive: cy.isActive,
      createdAt: cy.createdAt,
      updatedAt: cy.updatedAt,
    }));
  }
}
