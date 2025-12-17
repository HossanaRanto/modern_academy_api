import { ApiProperty } from '@nestjs/swagger';
import {
  IsUUID,
  IsNotEmpty,
  IsNumber,
  IsBoolean,
  IsString,
  IsOptional,
  Min,
  Max,
} from 'class-validator';

export class CreateNoteDto {
  @ApiProperty({
    description: 'Student Registration Number',
    example: 'STU001',
  })
  @IsString()
  @IsNotEmpty()
  registrationNumber: string;

  @ApiProperty({
    description: 'Test Code (format: TrimX-Y, e.g., Trim1-1 for first trimester first test)',
    example: 'Trim1-1',
  })
  @IsString()
  @IsNotEmpty()
  testCode: string;

  @ApiProperty({
    description: 'Course Code',
    example: 'MATH101',
  })
  @IsString()
  @IsNotEmpty()
  courseCode: string;

  @ApiProperty({
    description: 'Score obtained by the student',
    example: 15.5,
    minimum: 0,
  })
  @IsNumber()
  @Min(0)
  score: number;

  @ApiProperty({
    description: 'Maximum score possible',
    example: 20,
    default: 20,
    minimum: 0,
  })
  @IsNumber()
  @Min(0)
  @IsOptional()
  maxScore?: number;

  @ApiProperty({
    description: 'Whether the student was absent',
    example: false,
    default: false,
    required: false,
  })
  @IsBoolean()
  @IsOptional()
  isAbsent?: boolean;

  @ApiProperty({
    description: 'Additional comments about the note',
    example: 'Good performance',
    required: false,
  })
  @IsString()
  @IsOptional()
  comment?: string;
}
