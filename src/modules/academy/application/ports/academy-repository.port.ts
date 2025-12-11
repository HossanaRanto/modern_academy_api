import { Academy } from '../../../../entities/academy.entity';

export interface IAcademyRepository {
  findByCode(code: string): Promise<Academy | null>;
  findById(id: string): Promise<Academy | null>;
  findByUserId(userId: string): Promise<Academy | null>;
  create(academyData: Partial<Academy>): Promise<Academy>;
  save(academy: Academy): Promise<Academy>;
}

export const ACADEMY_REPOSITORY = Symbol('ACADEMY_REPOSITORY');
