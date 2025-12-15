import { IsString, IsOptional, IsInt, Min, IsBoolean } from 'class-validator';
import { ApiProperty } from '@nestjs/swagger';

export class UpdateClassYearDto {
  @ApiProperty({
    description: 'Section name',
    example: 'A',
    required: false,
  })
  @IsString()
  @IsOptional()
  section?: string;

  @ApiProperty({
    description: 'Room number',
    example: 'Room 101',
    required: false,
  })
  @IsString()
  @IsOptional()
  roomNumber?: string;

  @ApiProperty({
    description: 'Maximum number of students',
    example: 30,
    required: false,
  })
  @IsInt()
  @Min(1)
  @IsOptional()
  maxStudents?: number;

  @ApiProperty({
    description: 'Whether the class year is active',
    example: true,
    required: false,
  })
  @IsBoolean()
  @IsOptional()
  isActive?: boolean;
}
