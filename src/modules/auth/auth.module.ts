import { Module } from '@nestjs/common';
import { JwtModule } from '@nestjs/jwt';
import { PassportModule } from '@nestjs/passport';
import { TypeOrmModule } from '@nestjs/typeorm';
import { User } from '../../entities/user.entity';
import { AuthController } from './infrastructure/controllers/auth.controller';
import { SignUpUseCase } from './application/use-cases/signup.use-case';
import { SignInUseCase } from './application/use-cases/signin.use-case';
import { UserRepositoryAdapter } from './infrastructure/adapters/user-repository.adapter';
import { BcryptHasherAdapter } from './infrastructure/adapters/bcrypt-hasher.adapter';
import { JwtStrategy } from './infrastructure/strategies/jwt.strategy';
import { USER_REPOSITORY } from './application/ports/user-repository.port';
import { PASSWORD_HASHER } from './application/ports/password-hasher.port';

@Module({
  imports: [
    TypeOrmModule.forFeature([User]),
    PassportModule.register({ defaultStrategy: 'jwt' }),
    JwtModule.register({
      secret: process.env.JWT_SECRET || 'your-secret-key-change-in-production',
      signOptions: {
        expiresIn: '24h',
      },
    }),
  ],
  controllers: [AuthController],
  providers: [
    SignUpUseCase,
    SignInUseCase,
    JwtStrategy,
    {
      provide: USER_REPOSITORY,
      useClass: UserRepositoryAdapter,
    },
    {
      provide: PASSWORD_HASHER,
      useClass: BcryptHasherAdapter,
    },
  ],
  exports: [JwtModule, PassportModule],
})
export class AuthModule {}
