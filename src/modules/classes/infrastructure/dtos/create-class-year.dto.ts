import { IsString, IsOptional, IsInt, Min, IsUUID } from 'class-validator';
import { ApiProperty } from '@nestjs/swagger';

export class CreateClassYearDto {
  @ApiProperty({
    description: 'Class ID',
    example: '660e8400-e29b-41d4-a716-446655440000',
  })
  @IsUUID()
  classId: string;

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
}
