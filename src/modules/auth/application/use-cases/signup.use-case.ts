import { Inject, Injectable, ConflictException } from '@nestjs/common';
import * as UserPort from '../ports/user-repository.port';
import * as PasswordPort from '../ports/password-hasher.port';
import { SignUpRequest, AuthResponse } from '../../domain/auth.interface';
import { JwtService } from '@nestjs/jwt';
import { UserRole } from '../../../../entities/user.entity';

@Injectable()
export class SignUpUseCase {
  constructor(
    @Inject(UserPort.USER_REPOSITORY)
    private readonly userRepository: UserPort.IUserRepository,
    @Inject(PasswordPort.PASSWORD_HASHER)
    private readonly passwordHasher: PasswordPort.IPasswordHasher,
    private readonly jwtService: JwtService,
  ) {}

  async execute(request: SignUpRequest): Promise<AuthResponse> {
    // Check if user already exists
    const existingUser = await this.userRepository.findByEmail(request.email);
    if (existingUser) {
      throw new ConflictException('User with this email already exists');
    }

    // Hash password
    const hashedPassword = await this.passwordHasher.hash(request.password);

    // Create user (as super admin for first user, otherwise as staff)
    const user = await this.userRepository.create({
      firstName: request.firstName,
      lastName: request.lastName,
      email: request.email,
      password: hashedPassword,
      phone: request.phone,
      role: UserRole.SUPER_ADMIN, // First user becomes super admin, can be adjusted
      isActive: true,
    });

    // Generate JWT token
    const payload = {
      sub: user.id,
      email: user.email,
      role: user.role,
      academyId: user.academyId,
    };

    const accessToken = this.jwtService.sign(payload);

    return {
      accessToken,
      user: {
        id: user.id,
        email: user.email,
        firstName: user.firstName,
        lastName: user.lastName,
        role: user.role,
        academyId: user.academyId,
      },
    };
  }
}
