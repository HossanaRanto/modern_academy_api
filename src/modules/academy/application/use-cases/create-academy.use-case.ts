import { Inject, Injectable, ConflictException, NotFoundException } from '@nestjs/common';
import * as AcademyPort from '../ports/academy-repository.port';
import * as UserPort from '../../../auth/application/ports/user-repository.port';
import { CreateAcademyRequest, AcademyResponse } from '../../domain/academy.interface';

@Injectable()
export class CreateAcademyUseCase {
  constructor(
    @Inject(AcademyPort.ACADEMY_REPOSITORY)
    private readonly academyRepository: AcademyPort.IAcademyRepository,
    @Inject(UserPort.USER_REPOSITORY)
    private readonly userRepository: UserPort.IUserRepository,
  ) {}

  async execute(request: CreateAcademyRequest, userId: string): Promise<AcademyResponse> {
    // Check if academy with the same code already exists
    const existingAcademy = await this.academyRepository.findByCode(request.code);
    if (existingAcademy) {
      throw new ConflictException('Academy with this code already exists');
    }

    // Check if user exists
    const user = await this.userRepository.findById(userId);
    if (!user) {
      throw new NotFoundException('User not found');
    }

    // Check if user already has an academy
    if (user.academyId) {
      throw new ConflictException('User already has an academy');
    }

    // Create academy
    const academy = await this.academyRepository.create({
      name: request.name,
      code: request.code,
      address: request.address,
      phone: request.phone,
      email: request.email,
      isActive: true,
    });

    // Update user with academy reference
    user.academyId = academy.id;
    await this.userRepository.save(user);

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
