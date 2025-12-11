import { Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { AcademicYear } from '../../../../entities/academic-year.entity';
import { IAcademicYearRepository } from '../../application/ports/academic-year-repository.port';

@Injectable()
export class AcademicYearRepositoryAdapter implements IAcademicYearRepository {
  constructor(
    @InjectRepository(AcademicYear)
    private readonly academicYearRepository: Repository<AcademicYear>,
  ) {}

  async create(academicYear: Partial<AcademicYear>): Promise<AcademicYear> {
    const newAcademicYear = this.academicYearRepository.create(academicYear);
    return await this.academicYearRepository.save(newAcademicYear);
  }

  async findById(id: string): Promise<AcademicYear | null> {
    return await this.academicYearRepository.findOne({ 
      where: { id },
    });
  }

  async findByAcademyId(academyId: string): Promise<AcademicYear[]> {
    return await this.academicYearRepository.find({
      where: { academyId },
      order: { startDate: 'DESC' },
    });
  }

  async findCurrentByAcademyId(academyId: string): Promise<AcademicYear | null> {
    return await this.academicYearRepository.findOne({
      where: { 
        academyId,
        isCurrent: true,
      },
    });
  }

  async update(id: string, academicYear: Partial<AcademicYear>): Promise<AcademicYear> {
    await this.academicYearRepository.update(id, academicYear);
    const updated = await this.findById(id);
    if (!updated) {
      throw new Error('Academic year not found after update');
    }
    return updated;
  }

  async setAsCurrent(id: string, academyId: string): Promise<AcademicYear> {
    // Set all academic years to not current
    await this.academicYearRepository.update(
      { academyId },
      { isCurrent: false },
    );

    // Set the specified one as current
    await this.academicYearRepository.update(id, { isCurrent: true });

    const updated = await this.findById(id);
    if (!updated) {
      throw new Error('Academic year not found after update');
    }
    return updated;
  }
}
