import { ClassYear } from '../../../../entities/class-year.entity';

export interface IClassYearRepository {
  findById(id: string): Promise<ClassYear | null>;
  findByClassAndAcademicYear(classId: string, academicYearId: string): Promise<ClassYear | null>;
  findByAcademicYear(academicYearId: string): Promise<ClassYear[]>;
  findByClass(classId: string): Promise<ClassYear[]>;
  create(classYearData: Partial<ClassYear>): Promise<ClassYear>;
  save(classYear: ClassYear): Promise<ClassYear>;
  delete(id: string): Promise<void>;
}

export const CLASS_YEAR_REPOSITORY = Symbol('CLASS_YEAR_REPOSITORY');
