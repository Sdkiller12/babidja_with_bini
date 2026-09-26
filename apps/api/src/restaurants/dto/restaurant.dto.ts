import { IsArray, IsInt, IsOptional, IsString } from 'class-validator';

export class UpdateRestaurantSettingsDto {
  @IsOptional()
  @IsArray()
  @IsString({ each: true })
  cuisineType?: string[];

  @IsOptional()
  @IsString()
  priceRange?: string;

  @IsOptional()
  openingHours?: any; // JSON

  @IsOptional()
  @IsInt()
  capacity?: number;
}
