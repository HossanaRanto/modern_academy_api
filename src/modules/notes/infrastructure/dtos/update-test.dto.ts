import { ApiProperty } from '@nestjs/swagger';
import { 
  IsString, 
  IsEnum, 
  IsNumber, 
  IsDate, 
  IsOptional,
  Min,
  Max,
} from 'class-validator';
import { Type } from 'class-transformer';
import { TestType } from '../../../../entities/test.entity';

export class UpdateTestDto {
  @ApiProperty({
    description: 'Name of the test',
    example: 'Mathematics Mid-Term Exam',
    required: false,
  })
  @IsString()
  @IsOptional()
  name?: string;

  @ApiProperty({
    description: 'Type of the test',
    enum: TestType,
    example: TestType.EXAM,
    required: false,
  })
  @IsEnum(TestType)
  @IsOptional()
  type?: TestType;

  @ApiProperty({
    description: 'Date of the test',
    example: '2025-12-15',
    required: false,
  })
  @IsDate()
  @Type(() => Date)
  @IsOptional()
  date?: Date;

  @ApiProperty({
    description: 'Percentage weight of the test in the trimester grade',
    example: 50,
    minimum: 0,
    maximum: 100,
    required: false,
  })
  @IsNumber()
  @Min(0)
  @Max(100)
  @IsOptional()
  percentage?: number;

  @ApiProperty({
    description: 'Description or instructions for the test',
    example: 'Chapters 1-5 covered',
    required: false,
  })
  @IsString()
  @IsOptional()
  description?: string;
}
