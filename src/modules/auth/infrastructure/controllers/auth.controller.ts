import { Controller, Post, Body, HttpCode, HttpStatus } from '@nestjs/common';
import { ApiTags, ApiOperation, ApiResponse, ApiBody } from '@nestjs/swagger';
import { SignUpUseCase } from '../../application/use-cases/signup.use-case';
import { SignInUseCase } from '../../application/use-cases/signin.use-case';
import { SignUpDto } from '../dtos/signup.dto';
import { SignInDto } from '../dtos/signin.dto';

@ApiTags('Authentication')
@Controller('auth')
export class AuthController {
  constructor(
    private readonly signUpUseCase: SignUpUseCase,
    private readonly signInUseCase: SignInUseCase,
  ) {}

  @Post('signup')
  @ApiOperation({ 
    summary: 'Sign up a new user',
    description: 'Register a new user account. The first user will be created as SUPER_ADMIN.',
  })
  @ApiBody({ type: SignUpDto })
  @ApiResponse({
    status: 201,
    description: 'User successfully created',
    schema: {
      example: {
        accessToken: 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...',
        user: {
          id: '550e8400-e29b-41d4-a716-446655440000',
          email: 'john.doe@example.com',
          firstName: 'John',
          lastName: 'Doe',
          role: 'super_admin',
          academyId: null,
        },
      },
    },
  })
  @ApiResponse({
    status: 409,
    description: 'User with this email already exists',
  })
  @ApiResponse({
    status: 400,
    description: 'Validation error',
  })
  async signUp(@Body() request: SignUpDto) {
    return this.signUpUseCase.execute(request);
  }

  @Post('signin')
  @HttpCode(HttpStatus.OK)
  @ApiOperation({ 
    summary: 'Sign in user',
    description: 'Authenticate user and receive JWT token',
  })
  @ApiBody({ type: SignInDto })
  @ApiResponse({
    status: 200,
    description: 'User successfully authenticated',
    schema: {
      example: {
        accessToken: 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...',
        user: {
          id: '550e8400-e29b-41d4-a716-446655440000',
          email: 'john.doe@example.com',
          firstName: 'John',
          lastName: 'Doe',
          role: 'super_admin',
          academyId: '660e8400-e29b-41d4-a716-446655440000',
        },
      },
    },
  })
  @ApiResponse({
    status: 401,
    description: 'Invalid credentials or user account is inactive',
  })
  async signIn(@Body() request: SignInDto) {
    return this.signInUseCase.execute(request);
  }
}
