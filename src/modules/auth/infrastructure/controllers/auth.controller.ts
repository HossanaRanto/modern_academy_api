import { Controller, Post, Body, HttpCode, HttpStatus } from '@nestjs/common';
import { SignUpUseCase } from '../../application/use-cases/signup.use-case';
import { SignInUseCase } from '../../application/use-cases/signin.use-case';
import { SignUpDto } from '../dtos/signup.dto';
import { SignInDto } from '../dtos/signin.dto';

@Controller('auth')
export class AuthController {
  constructor(
    private readonly signUpUseCase: SignUpUseCase,
    private readonly signInUseCase: SignInUseCase,
  ) {}

  @Post('signup')
  async signUp(@Body() request: SignUpDto) {
    return this.signUpUseCase.execute(request);
  }

  @Post('signin')
  @HttpCode(HttpStatus.OK)
  async signIn(@Body() request: SignInDto) {
    return this.signInUseCase.execute(request);
  }
}
