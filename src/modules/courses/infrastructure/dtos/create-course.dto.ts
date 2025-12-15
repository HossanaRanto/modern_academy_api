import { IsString, IsNotEmpty, IsOptional, IsInt, Min } from 'class-validator';
import { ApiProperty } from '@nestjs/swagger';

export class CreateCourseDto {
  @ApiProperty({
    description: 'Course name',
    example: 'Mathematics',
  })
  @IsString()
  @IsNotEmpty()
  name: string;

  @ApiProperty({
    description: 'Unique course code',
    example: 'MATH101',
  })
  @IsString()
  @IsNotEmpty()
  code: string;

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
}
