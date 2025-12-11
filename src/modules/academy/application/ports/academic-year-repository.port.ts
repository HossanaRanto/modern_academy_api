import { AcademicYear } from '../../../../entities/academic-year.entity';

export interface IAcademicYearRepository {
  create(academicYear: Partial<AcademicYear>): Promise<AcademicYear>;
  findById(id: string): Promise<AcademicYear | null>;
  findByAcademyId(academyId: string): Promise<AcademicYear[]>;
  findCurrentByAcademyId(academyId: string): Promise<AcademicYear | null>;
  update(id: string, academicYear: Partial<AcademicYear>): Promise<AcademicYear>;
  setAsCurrent(id: string, academyId: string): Promise<AcademicYear>;
}

export const ACADEMIC_YEAR_REPOSITORY = Symbol('ACADEMIC_YEAR_REPOSITORY');
