import { IsBoolean, IsDateString, IsOptional, IsString } from 'class-validator';

export class Passport {
  @IsString()
  documentNumber: string;

  @IsString()
  authority: string;

  @IsDateString()
  authorityDate: string;

  @IsDateString()
  @IsOptional()
  expiryAt?: string;

  @IsBoolean()
  noExpirationDate: boolean;

  @IsString()
  citizenshipCountryCode: string;

  @IsString()
  originCountryCode: string;

  @IsString()
  placeOfBirth: string;
}
