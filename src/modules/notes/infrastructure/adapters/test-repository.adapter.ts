import { Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { Test } from '../../../../entities/test.entity';
import { ITestRepository } from '../../application/ports/test-repository.port';

@Injectable()
export class TestRepositoryAdapter implements ITestRepository {
  constructor(
    @InjectRepository(Test)
    private readonly testRepository: Repository<Test>,
  ) {}

  async findById(id: string): Promise<Test | null> {
    return this.testRepository.findOne({
      where: { id },
      relations: ['trimester'],
    });
  }

  async findByTrimester(trimesterId: string): Promise<Test[]> {
    return this.testRepository.find({
      where: { trimesterId },
      relations: ['trimester'],
      order: { date: 'ASC' },
    });
  }

  async findByTrimesterOrderAndTestIndex(
    trimesterOrder: number,
    testIndex: number,
    academicYearId: string,
  ): Promise<Test | null> {
    const query = this.testRepository
      .createQueryBuilder('test')
      .innerJoinAndSelect('test.trimester', 'trimester')
      .where('trimester.academicYearId = :academicYearId', { academicYearId })
      .andWhere('trimester.order = :trimesterOrder', { trimesterOrder })
      .orderBy('test.date', 'ASC');

    const tests = await query.getMany();

    // Get the test at the specified index (1-indexed)
    if (testIndex > 0 && testIndex <= tests.length) {
      return tests[testIndex - 1];
    }

    return null;
  }

  async create(testData: Partial<Test>): Promise<Test> {
    const test = this.testRepository.create(testData);
    return this.testRepository.save(test);
  }

  async save(test: Test): Promise<Test> {
    return this.testRepository.save(test);
  }

  async delete(id: string): Promise<void> {
    await this.testRepository.delete(id);
  }
}
