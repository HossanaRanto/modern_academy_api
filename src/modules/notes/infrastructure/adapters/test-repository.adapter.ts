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
      relations: ['trimester', 'courseClass', 'courseClass.course', 'courseClass.classYear'],
    });
  }

  async findByTrimester(trimesterId: string): Promise<Test[]> {
    return this.testRepository.find({
      where: { trimesterId },
      relations: ['courseClass', 'courseClass.course', 'trimester'],
      order: { date: 'ASC' },
    });
  }

  async findByCourseClass(courseClassId: string): Promise<Test[]> {
    return this.testRepository.find({
      where: { courseClassId },
      relations: ['trimester', 'courseClass', 'courseClass.course'],
      order: { date: 'ASC' },
    });
  }

  async findByCourseClassAndTrimester(
    courseClassId: string,
    trimesterId: string,
  ): Promise<Test[]> {
    return this.testRepository.find({
      where: { courseClassId, trimesterId },
      relations: ['trimester', 'courseClass', 'courseClass.course'],
      order: { date: 'ASC' },
    });
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
