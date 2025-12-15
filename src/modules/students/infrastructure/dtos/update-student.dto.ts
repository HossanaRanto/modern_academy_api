import { IsString, IsDate, IsEnum, IsOptional, IsBoolean } from 'class-validator';
import { Type } from 'class-transformer';
import { ApiPropertyOptional } from '@nestjs/swagger';
import { Gender } from '../../../../entities/student.entity';

export class UpdateStudentDto {
  @ApiPropertyOptional({ example: 'John', description: 'Student first name' })
  @IsString()
  @IsOptional()
  firstName?: string;

  @ApiPropertyOptional({ example: 'Doe', description: 'Student last name' })
  @IsString()
  @IsOptional()
  lastName?: string;

  @ApiPropertyOptional({ example: '2010-05-15', description: 'Date of birth' })
  @IsDate()
  @Type(() => Date)
  @IsOptional()
  dateOfBirth?: Date;

  @ApiPropertyOptional({ example: 'New York', description: 'Place of birth' })
  @IsString()
  @IsOptional()
  placeOfBirth?: string;

  @ApiPropertyOptional({ enum: Gender, example: Gender.MALE, description: 'Student gender' })
  @IsEnum(Gender)
  @IsOptional()
  gender?: Gender;

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

  @ApiPropertyOptional({ example: true, description: 'Whether the student is active' })
  @IsBoolean()
  @IsOptional()
  isActive?: boolean;
}
