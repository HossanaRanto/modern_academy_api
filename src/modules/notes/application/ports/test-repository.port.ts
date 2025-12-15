import { Test } from '../../../../entities/test.entity';

export interface ITestRepository {
  findById(id: string): Promise<Test | null>;
  findByTrimester(trimesterId: string): Promise<Test[]>;
  findByCourseClass(courseClassId: string): Promise<Test[]>;
  findByCourseClassAndTrimester(
    courseClassId: string,
    trimesterId: string,
  ): Promise<Test[]>;
  create(testData: Partial<Test>): Promise<Test>;
  save(test: Test): Promise<Test>;
  delete(id: string): Promise<void>;
}

export const TEST_REPOSITORY = Symbol('TEST_REPOSITORY');
