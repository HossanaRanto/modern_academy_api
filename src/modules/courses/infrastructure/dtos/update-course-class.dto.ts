import { IsOptional, IsInt, Min, IsBoolean, IsUUID } from 'class-validator';
import { ApiProperty } from '@nestjs/swagger';

export class UpdateCourseClassDto {
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

  @ApiProperty({
    description: 'Whether the course class is active',
    example: true,
    required: false,
  })
  @IsBoolean()
  @IsOptional()
  isActive?: boolean;
}
