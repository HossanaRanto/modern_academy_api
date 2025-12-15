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
    description: 'Student ID',
    example: '440e8400-e29b-41d4-a716-446655440000',
  })
  @IsUUID()
  @IsNotEmpty()
  studentId: string;

  @ApiProperty({
    description: 'Test ID',
    example: '880e8400-e29b-41d4-a716-446655440000',
  })
  @IsUUID()
  @IsNotEmpty()
  testId: string;

  @ApiProperty({
    description: 'Course ID',
    example: '330e8400-e29b-41d4-a716-446655440000',
  })
  @IsUUID()
  @IsNotEmpty()
  courseId: string;

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
