import { ApiProperty } from '@nestjs/swagger';
import {
  IsNumber,
  IsBoolean,
  IsString,
  IsOptional,
  Min,
} from 'class-validator';

export class UpdateNoteDto {
  @ApiProperty({
    description: 'Score obtained by the student',
    example: 15.5,
    minimum: 0,
    required: false,
  })
  @IsNumber()
  @Min(0)
  @IsOptional()
  score?: number;

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
