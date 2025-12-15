import { IsString, IsOptional, IsInt, Min, IsBoolean } from 'class-validator';
import { ApiProperty } from '@nestjs/swagger';

export class UpdateCourseDto {
  @ApiProperty({
    description: 'Course name',
    example: 'Mathematics',
    required: false,
  })
  @IsString()
  @IsOptional()
  name?: string;

  @ApiProperty({
    description: 'Unique course code',
    example: 'MATH101',
    required: false,
  })
  @IsString()
  @IsOptional()
  code?: string;

  @ApiProperty({
    description: 'Course description',
    example: 'Introduction to Mathematics',
    required: false,
  })
  @IsString()
  @IsOptional()
  description?: string;

  @ApiProperty({
    description: 'Course coefficient for grading',
    example: 2,
    required: false,
  })
  @IsInt()
  @Min(1)
  @IsOptional()
  coefficient?: number;

  @ApiProperty({
    description: 'Course category',
    example: 'Sciences',
    required: false,
  })
  @IsString()
  @IsOptional()
  category?: string;

  @ApiProperty({
    description: 'Whether the course is active',
    example: true,
    required: false,
  })
  @IsBoolean()
  @IsOptional()
  isActive?: boolean;
}
