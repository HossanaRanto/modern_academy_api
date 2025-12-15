import { IsString, IsOptional, IsInt, Min, IsBoolean, IsUUID } from 'class-validator';
import { ApiProperty } from '@nestjs/swagger';

export class UpdateClassDto {
  @ApiProperty({
    description: 'Class name',
    example: 'Grade 1A',
    required: false,
  })
  @IsString()
  @IsOptional()
  name?: string;

  @ApiProperty({
    description: 'Unique class code',
    example: 'G1A',
    required: false,
  })
  @IsString()
  @IsOptional()
  code?: string;

  @ApiProperty({
    description: 'Class level (grade)',
    example: 1,
    required: false,
  })
  @IsInt()
  @Min(1)
  @IsOptional()
  level?: number;

  @ApiProperty({
    description: 'Class description',
    example: 'First grade section A',
    required: false,
  })
  @IsString()
  @IsOptional()
  description?: string;

  @ApiProperty({
    description: 'Maximum student capacity',
    example: 30,
    required: false,
  })
  @IsInt()
  @Min(1)
  @IsOptional()
  capacity?: number;

  @ApiProperty({
    description: 'Whether the class is active',
    example: true,
    required: false,
  })
  @IsBoolean()
  @IsOptional()
  isActive?: boolean;

  @ApiProperty({
    description: 'Child class ID (next grade level)',
    example: '660e8400-e29b-41d4-a716-446655440000',
    required: false,
  })
  @IsUUID()
  @IsOptional()
  childClassId?: string;
}
