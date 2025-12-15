import { IsString, IsNotEmpty, IsOptional, IsInt, Min, IsUUID } from 'class-validator';
import { ApiProperty } from '@nestjs/swagger';

export class CreateClassDto {
  @ApiProperty({
    description: 'Class name',
    example: 'Grade 1A',
  })
  @IsString()
  @IsNotEmpty()
  name: string;

  @ApiProperty({
    description: 'Unique class code',
    example: 'G1A',
  })
  @IsString()
  @IsNotEmpty()
  code: string;

  @ApiProperty({
    description: 'Class level (grade)',
    example: 1,
  })
  @IsInt()
  @Min(1)
  level: number;

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
    description: 'Child class ID (next grade level)',
    example: '660e8400-e29b-41d4-a716-446655440000',
    required: false,
  })
  @IsUUID()
  @IsOptional()
  childClassId?: string;
}
