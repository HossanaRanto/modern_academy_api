import { IsString, IsNotEmpty, IsOptional, IsEmail } from 'class-validator';
import { ApiProperty } from '@nestjs/swagger';

export class CreateAcademyDto {
  @ApiProperty({
    description: 'Academy name',
    example: 'Modern Academy',
  })
  @IsString()
  @IsNotEmpty()
  name: string;

  @ApiProperty({
    description: 'Unique academy code',
    example: 'MA001',
  })
  @IsString()
  @IsNotEmpty()
  code: string;

  @ApiProperty({
    description: 'Academy address',
    example: '123 Main Street, City',
    required: false,
  })
  @IsString()
  @IsOptional()
  address?: string;

  @ApiProperty({
    description: 'Academy phone number',
    example: '+1234567890',
    required: false,
  })
  @IsString()
  @IsOptional()
  phone?: string;

  @ApiProperty({
    description: 'Academy email address',
    example: 'info@modernacademy.com',
    required: false,
  })
  @IsEmail()
  @IsOptional()
  email?: string;
}
