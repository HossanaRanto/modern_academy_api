import { Class } from '../../../../entities/class.entity';

export interface IClassRepository {
  findByCode(code: string): Promise<Class | null>;
  findById(id: string): Promise<Class | null>;
  findAll(academyId: string): Promise<Class[]>;
  findAllActive(academyId: string): Promise<Class[]>;
  create(classData: Partial<Class>): Promise<Class>;
  save(classEntity: Class): Promise<Class>;
  delete(id: string): Promise<void>;
}

export const CLASS_REPOSITORY = Symbol('CLASS_REPOSITORY');
