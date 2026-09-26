import { IsString, IsEnum, IsEmail, IsOptional, IsNotEmpty } from 'class-validator';
import { TenantType } from '@prisma/client';

export class ApplyTenantDto {
  @IsString()
  @IsNotEmpty()
  companyName: string;

  @IsEnum(TenantType)
  type: TenantType;

  @IsString()
  @IsNotEmpty()
  contactName: string;

  @IsEmail()
  contactEmail: string;

  @IsString()
  @IsNotEmpty()
  contactPhone: string;

  @IsString()
  @IsOptional()
  description?: string;

  @IsString()
  @IsNotEmpty()
  city: string;

  @IsString()
  @IsNotEmpty()
  address: string;

  @IsString()
  @IsOptional()
  notes?: string;
}
