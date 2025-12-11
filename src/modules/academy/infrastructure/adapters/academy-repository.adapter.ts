import { Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { Academy } from '../../../../entities/academy.entity';
import { IAcademyRepository } from '../../application/ports/academy-repository.port';

@Injectable()
export class AcademyRepositoryAdapter implements IAcademyRepository {
  constructor(
    @InjectRepository(Academy)
    private readonly academyRepository: Repository<Academy>,
  ) {}

  async findByCode(code: string): Promise<Academy | null> {
    return this.academyRepository.findOne({ where: { code } });
  }

  async findById(id: string): Promise<Academy | null> {
    return this.academyRepository.findOne({ where: { id } });
  }

  async findByUserId(userId: string): Promise<Academy | null> {
    return this.academyRepository.findOne({
      where: { users: { id: userId } },
      relations: ['users'],
    });
  }

  async create(academyData: Partial<Academy>): Promise<Academy> {
    const academy = this.academyRepository.create(academyData);
    return this.academyRepository.save(academy);
  }

  async save(academy: Academy): Promise<Academy> {
    return this.academyRepository.save(academy);
  }
}
