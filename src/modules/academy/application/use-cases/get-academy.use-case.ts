import { Inject, Injectable, NotFoundException } from '@nestjs/common';
import * as AcademyPort from '../ports/academy-repository.port';
import { AcademyResponse } from '../../domain/academy.interface';

@Injectable()
export class GetAcademyUseCase {
  constructor(
    @Inject(AcademyPort.ACADEMY_REPOSITORY)
    private readonly academyRepository: AcademyPort.IAcademyRepository,
  ) {}

  async execute(academyId: string): Promise<AcademyResponse> {
    const academy = await this.academyRepository.findById(academyId);
    
    if (!academy) {
      throw new NotFoundException('Academy not found');
    }

    return {
      id: academy.id,
      name: academy.name,
      code: academy.code,
      address: academy.address,
      phone: academy.phone,
      email: academy.email,
      logo: academy.logo,
      isActive: academy.isActive,
      createdAt: academy.createdAt,
      updatedAt: academy.updatedAt,
    };
  }
}
