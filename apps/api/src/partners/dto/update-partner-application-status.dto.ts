import { IsEnum, IsNotEmpty, IsOptional, IsString } from 'class-validator';
import { PartnerApplicationStatus } from '@prisma/client';

export class UpdatePartnerApplicationStatusDto {
  @IsNotEmpty()
  @IsEnum(PartnerApplicationStatus)
  status: PartnerApplicationStatus;

  @IsOptional()
  @IsString()
  reviewNotes?: string;
}
