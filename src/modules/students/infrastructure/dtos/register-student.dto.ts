import { IsString, IsNotEmpty, IsDate, IsEnum, IsOptional, IsNumber, IsUUID } from 'class-validator';
import { Type } from 'class-transformer';
import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';
import { Gender } from '../../../../entities/student.entity';

export class RegisterStudentDto {
  @ApiProperty({ example: 'John', description: 'Student first name' })
  @IsString()
  @IsNotEmpty()
  firstName: string;

  @ApiProperty({ example: 'Doe', description: 'Student last name' })
  @IsString()
  @IsNotEmpty()
  lastName: string;

  @ApiProperty({ example: 'STU2025001', description: 'Unique registration number' })
  @IsString()
  @IsNotEmpty()
  registrationNumber: string;

  @ApiProperty({ example: '2010-05-15', description: 'Date of birth' })
  @IsDate()
  @Type(() => Date)
  @IsNotEmpty()
  dateOfBirth: Date;

  @ApiPropertyOptional({ example: 'New York', description: 'Place of birth' })
  @IsString()
  @IsOptional()
  placeOfBirth?: string;

  @ApiProperty({ enum: Gender, example: Gender.MALE, description: 'Student gender' })
  @IsEnum(Gender)
  @IsNotEmpty()
  gender: Gender;

  @ApiPropertyOptional({ example: 'https://example.com/photo.jpg', description: 'Photo URL' })
  @IsString()
  @IsOptional()
  photo?: string;

  @ApiPropertyOptional({ example: '123 Main St', description: 'Student address' })
  @IsString()
  @IsOptional()
  address?: string;

  @ApiPropertyOptional({ example: '+1234567890', description: 'Student phone' })
  @IsString()
  @IsOptional()
  phone?: string;

  @ApiPropertyOptional({ example: 'student@example.com', description: 'Student email' })
  @IsString()
  @IsOptional()
  email?: string;

  @ApiPropertyOptional({ example: 'Jane Doe', description: 'Parent/Guardian name' })
  @IsString()
  @IsOptional()
  parentName?: string;

  @ApiPropertyOptional({ example: '+1234567890', description: 'Parent phone' })
  @IsString()
  @IsOptional()
  parentPhone?: string;

  @ApiPropertyOptional({ example: 'parent@example.com', description: 'Parent email' })
  @IsString()
  @IsOptional()
  parentEmail?: string;

  @ApiProperty({ description: 'Class year ID for the current academic year' })
  @IsUUID()
  @IsNotEmpty()
  classYearId: string;

  @ApiProperty({ example: '2025-12-15', description: 'Inscription date' })
  @IsDate()
  @Type(() => Date)
  @IsNotEmpty()
  inscriptionDate: Date;

  @ApiPropertyOptional({ example: 5000, description: 'Tuition fee amount' })
  @IsNumber()
  @IsOptional()
  tuitionFee?: number;

  @ApiPropertyOptional({ example: 'Special accommodation needed', description: 'Additional notes' })
  @IsString()
  @IsOptional()
  notes?: string;
}
