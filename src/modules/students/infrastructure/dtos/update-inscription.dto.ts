import { IsEnum, IsOptional, IsNumber, IsBoolean, IsString } from 'class-validator';
import { ApiPropertyOptional } from '@nestjs/swagger';
import { InscriptionStatus } from '../../../../entities/student-inscription.entity';

export class UpdateInscriptionDto {
  @ApiPropertyOptional({ enum: InscriptionStatus, example: InscriptionStatus.CONFIRMED, description: 'Inscription status' })
  @IsEnum(InscriptionStatus)
  @IsOptional()
  status?: InscriptionStatus;

  @ApiPropertyOptional({ example: 5000, description: 'Tuition fee amount' })
  @IsNumber()
  @IsOptional()
  tuitionFee?: number;

  @ApiPropertyOptional({ example: true, description: 'Whether tuition is paid' })
  @IsBoolean()
  @IsOptional()
  isPaid?: boolean;

  @ApiPropertyOptional({ example: 'Payment plan approved', description: 'Additional notes' })
  @IsString()
  @IsOptional()
  notes?: string;
}
