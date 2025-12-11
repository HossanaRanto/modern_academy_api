import { Injectable, UnauthorizedException, Inject } from '@nestjs/common';
import { PassportStrategy } from '@nestjs/passport';
import { ExtractJwt, Strategy } from 'passport-jwt';
import { CACHE_MANAGER } from '@nestjs/cache-manager';
import type * as CacheManagerTypes from 'cache-manager';
import { JwtPayload } from '../../domain/auth.interface';
import { CurrentUserPayload } from '../../../../shared/types/current-user.type';
import * as IUserRepositoryModule from '../../application/ports/user-repository.port';
import { USER_REPOSITORY } from '../../application/ports/user-repository.port';
import { User } from 'src/entities';

@Injectable()
export class JwtStrategy extends PassportStrategy(Strategy) {
  constructor(
    @Inject(USER_REPOSITORY)
    private readonly userRepository: IUserRepositoryModule.IUserRepository,
    @Inject(CACHE_MANAGER)
    private readonly cacheManager: CacheManagerTypes.Cache,
  ) {
    super({
      jwtFromRequest: ExtractJwt.fromAuthHeaderAsBearerToken(),
      ignoreExpiration: false,
      secretOrKey: process.env.JWT_SECRET || 'your-secret-key-change-in-production',
    });
  }

  async validate(payload: JwtPayload): Promise<CurrentUserPayload> {
    if (!payload.sub || !payload.email) {
      throw new UnauthorizedException('Invalid token payload');
    }

    // Try to fetch user from cache or database
    const cacheKey = `user:id:${payload.sub}`;
    let user = await this.cacheManager.get<User | null>(cacheKey);

    if (!user) {
      // If not in cache, fetch from database
      user = await this.userRepository.findById(payload.sub);
      
      if (!user) {
        throw new UnauthorizedException('User not found');
      }

      // Cache the user
      await this.cacheManager.set(cacheKey, user);
    }

    return {
      userId: payload.sub,
      email: payload.email,
      role: payload.role,
      academyId: user!.academyId,
    };
  }
}
