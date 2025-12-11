import { IsString, IsNotEmpty, IsDateString, MinLength } from 'class-validator';
import { ApiProperty } from '@nestjs/swagger';

export class CreateAcademicYearDto {
  @ApiProperty({
    description: 'Name of the academic year',
    example: '2024-2025',
    minLength: 3,
  })
  @IsString()
  @IsNotEmpty()
  @MinLength(3)
  name: string;

  @ApiProperty({
    description: 'Start date of the academic year',
    example: '2024-09-01',
    type: String,
    format: 'date',
  })
  @IsDateString()
  @IsNotEmpty()
  startDate: Date;

  @ApiProperty({
    description: 'End date of the academic year',
    example: '2025-06-30',
    type: String,
    format: 'date',
  })
  @IsDateString()
  @IsNotEmpty()
  endDate: Date;
}
