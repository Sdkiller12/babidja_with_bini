import { IsEmail, IsEnum, IsNotEmpty, IsPhoneNumber, IsString } from 'class-validator';
import { TenantType } from '@prisma/client';

export class CreatePartnerApplicationDto {
  @IsNotEmpty()
  @IsString()
  businessName: string;

  @IsNotEmpty()
  @IsEnum(TenantType)
  serviceType: TenantType;

  @IsNotEmpty()
  @IsString()
  registryNumber: string;

  @IsNotEmpty()
  @IsPhoneNumber()
  contactPhone: string;

  @IsNotEmpty()
  @IsEmail()
  contactEmail: string;
}
