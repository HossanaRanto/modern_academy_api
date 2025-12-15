import { ApiProperty } from '@nestjs/swagger';
import { 
  IsString, 
  IsNotEmpty, 
  IsEnum, 
  IsUUID, 
  IsNumber, 
  IsDate, 
  IsOptional,
  Min,
  Max,
} from 'class-validator';
import { Type } from 'class-transformer';
import { TestType } from '../../../../entities/test.entity';

export class CreateTestDto {
  @ApiProperty({
    description: 'Name of the test',
    example: 'Mathematics Mid-Term Exam',
  })
  @IsString()
  @IsNotEmpty()
  name: string;

  @ApiProperty({
    description: 'Type of the test',
    enum: TestType,
    example: TestType.EXAM,
  })
  @IsEnum(TestType)
  type: TestType;

  @ApiProperty({
    description: 'Date of the test',
    example: '2025-12-15',
  })
  @IsDate()
  @Type(() => Date)
  date: Date;

  @ApiProperty({
    description: 'Percentage weight of the test in the trimester grade',
    example: 50,
    minimum: 0,
    maximum: 100,
  })
  @IsNumber()
  @Min(0)
  @Max(100)
  percentage: number;

  @ApiProperty({
    description: 'ID of the course class',
    example: '550e8400-e29b-41d4-a716-446655440000',
  })
  @IsUUID()
  @IsNotEmpty()
  courseClassId: string;

  @ApiProperty({
    description: 'ID of the trimester',
    example: '660e8400-e29b-41d4-a716-446655440000',
  })
  @IsUUID()
  @IsNotEmpty()
  trimesterId: string;

  @ApiProperty({
    description: 'Description or instructions for the test',
    example: 'Chapters 1-5 covered',
    required: false,
  })
  @IsString()
  @IsOptional()
  description?: string;
}
