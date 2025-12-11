import { Inject, Injectable, UnauthorizedException } from '@nestjs/common';
import * as UserPort from '../ports/user-repository.port';
import * as PasswordPort from '../ports/password-hasher.port';
import { SignInRequest, AuthResponse } from '../../domain/auth.interface';
import { JwtService } from '@nestjs/jwt';

@Injectable()
export class SignInUseCase {
  constructor(
    @Inject(UserPort.USER_REPOSITORY)
    private readonly userRepository: UserPort.IUserRepository,
    @Inject(PasswordPort.PASSWORD_HASHER)
    private readonly passwordHasher: PasswordPort.IPasswordHasher,
    private readonly jwtService: JwtService,
  ) {}

  async execute(request: SignInRequest): Promise<AuthResponse> {
    // Find user by email
    const user = await this.userRepository.findByEmail(request.email);
    if (!user) {
      throw new UnauthorizedException('Invalid credentials');
    }

    // Check if user is active
    if (!user.isActive) {
      throw new UnauthorizedException('User account is inactive');
    }

    // Verify password
    const isPasswordValid = await this.passwordHasher.compare(
      request.password,
      user.password,
    );
    if (!isPasswordValid) {
      throw new UnauthorizedException('Invalid credentials');
    }

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
