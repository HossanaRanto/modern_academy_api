import { Test } from '../../../../entities/test.entity';

export interface ITestRepository {
  findById(id: string): Promise<Test | null>;
  findByTrimester(trimesterId: string): Promise<Test[]>;
  findByTrimesterOrderAndTestIndex(trimesterOrder: number, testIndex: number, academicYearId: string): Promise<Test | null>;
  create(testData: Partial<Test>): Promise<Test>;
  save(test: Test): Promise<Test>;
  delete(id: string): Promise<void>;
}

export const TEST_REPOSITORY = Symbol('TEST_REPOSITORY');
