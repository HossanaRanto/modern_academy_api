import { Trimester } from '../../../../entities/trimester.entity';

export interface ITrimesterRepository {
  findById(id: string): Promise<Trimester | null>;
  findByAcademicYear(academicYearId: string): Promise<Trimester[]>;
  findActiveByAcademicYear(academicYearId: string): Promise<Trimester[]>;
  create(trimesterData: Partial<Trimester>): Promise<Trimester>;
  save(trimester: Trimester): Promise<Trimester>;
  delete(id: string): Promise<void>;
}

export const TRIMESTER_REPOSITORY = Symbol('TRIMESTER_REPOSITORY');
