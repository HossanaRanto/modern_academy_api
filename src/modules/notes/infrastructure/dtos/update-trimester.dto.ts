import { ApiProperty } from '@nestjs/swagger';
import { 
  IsString, 
  IsNumber, 
  IsDate, 
  IsBoolean, 
  IsOptional,
  Min,
  Max,
} from 'class-validator';
import { Type } from 'class-transformer';

export class UpdateTrimesterDto {
  @ApiProperty({
    description: 'Name of the trimester',
    example: 'First Trimester',
    required: false,
  })
  @IsString()
  @IsOptional()
  name?: string;

  @ApiProperty({
    description: 'Order of the trimester (1, 2, 3)',
    example: 1,
    minimum: 1,
    maximum: 3,
    required: false,
  })
  @IsNumber()
  @Min(1)
  @Max(3)
  @IsOptional()
  order?: number;

  @ApiProperty({
    description: 'Start date of the trimester',
    example: '2025-09-01',
    required: false,
  })
  @IsDate()
  @Type(() => Date)
  @IsOptional()
  startDate?: Date;

  @ApiProperty({
    description: 'End date of the trimester',
    example: '2025-12-15',
    required: false,
  })
  @IsDate()
  @Type(() => Date)
  @IsOptional()
  endDate?: Date;

  @ApiProperty({
    description: 'Percentage weight of the trimester in the final grade',
    example: 33.33,
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
    description: 'Whether the trimester is active',
    example: true,
    required: false,
  })
  @IsBoolean()
  @IsOptional()
  isActive?: boolean;
}
