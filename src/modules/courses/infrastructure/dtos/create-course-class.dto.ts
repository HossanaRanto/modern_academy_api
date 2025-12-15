import { IsString, IsOptional, IsInt, Min, IsUUID } from 'class-validator';
import { ApiProperty } from '@nestjs/swagger';

export class CreateCourseClassDto {
  @ApiProperty({
    description: 'Course ID',
    example: '660e8400-e29b-41d4-a716-446655440000',
  })
  @IsUUID()
  courseId: string;

  @ApiProperty({
    description: 'Class Year ID',
    example: '660e8400-e29b-41d4-a716-446655440001',
  })
  @IsUUID()
  classYearId: string;

  @ApiProperty({
    description: 'Teacher ID',
    example: '660e8400-e29b-41d4-a716-446655440002',
    required: false,
  })
  @IsUUID()
  @IsOptional()
  teacherId?: string;

  @ApiProperty({
    description: 'Hours per week',
    example: 4,
    required: false,
  })
  @IsInt()
  @Min(1)
  @IsOptional()
  hoursPerWeek?: number;

  @ApiProperty({
    description: 'Coefficient for this course in this class',
    example: 2,
    required: false,
  })
  @IsInt()
  @Min(1)
  @IsOptional()
  coefficient?: number;
}
