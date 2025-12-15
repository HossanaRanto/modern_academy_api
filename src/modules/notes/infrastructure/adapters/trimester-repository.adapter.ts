import { Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { Trimester } from '../../../../entities/trimester.entity';
import { ITrimesterRepository } from '../../application/ports/trimester-repository.port';

@Injectable()
export class TrimesterRepositoryAdapter implements ITrimesterRepository {
  constructor(
    @InjectRepository(Trimester)
    private readonly trimesterRepository: Repository<Trimester>,
  ) {}

  async findById(id: string): Promise<Trimester | null> {
    return this.trimesterRepository.findOne({
      where: { id },
      relations: ['academicYear'],
    });
  }

  async findByAcademicYear(academicYearId: string): Promise<Trimester[]> {
    return this.trimesterRepository.find({
      where: { academicYearId },
      order: { order: 'ASC' },
      relations: ['academicYear'],
    });
  }

  async findActiveByAcademicYear(academicYearId: string): Promise<Trimester[]> {
    return this.trimesterRepository.find({
      where: { academicYearId, isActive: true },
      order: { order: 'ASC' },
      relations: ['academicYear'],
    });
  }

  async create(trimesterData: Partial<Trimester>): Promise<Trimester> {
    const trimester = this.trimesterRepository.create(trimesterData);
    return this.trimesterRepository.save(trimester);
  }

  async save(trimester: Trimester): Promise<Trimester> {
    return this.trimesterRepository.save(trimester);
  }

  async delete(id: string): Promise<void> {
    await this.trimesterRepository.delete(id);
  }
}
