import { ApiProperty } from '@nestjs/swagger';
import { Type } from 'class-transformer';
import {
  IsArray,
  ValidateNested,
  IsUUID,
  IsNotEmpty,
  IsNumber,
  IsBoolean,
  IsString,
  IsOptional,
  Min,
} from 'class-validator';

export class StudentNoteDto {
  @ApiProperty({
    description: 'Student ID',
    example: '440e8400-e29b-41d4-a716-446655440000',
  })
  @IsUUID()
  @IsNotEmpty()
  studentId: string;

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
    minimum: 0,
    required: false,
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
    description: 'Additional comments',
    example: 'Good performance',
    required: false,
  })
  @IsString()
  @IsOptional()
  comment?: string;
}

export class BulkUpdateNotesDto {
  @ApiProperty({
    description: 'Array of student notes to create/update',
    type: [StudentNoteDto],
  })
  @IsArray()
  @ValidateNested({ each: true })
  @Type(() => StudentNoteDto)
  notes: StudentNoteDto[];
}
