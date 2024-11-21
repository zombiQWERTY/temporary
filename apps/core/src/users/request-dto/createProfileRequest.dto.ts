import {
  IsArray,
  IsDateString,
  IsEmail,
  IsEnum,
  IsOptional,
  IsPhoneNumber,
  IsString,
  MinLength,
  ValidateNested,
} from 'class-validator';
import { Type } from 'class-transformer';
import { RoleEnum } from '@erp-modul/shared';
import { Passport } from './common/passportRequest.dto';
import { Location } from './common/locationRequest.dto';
import { Branch } from './common/branchRequest.dto';

export class CreateProfileRequestDto {
  @IsPhoneNumber()
  phone: string;

  @IsEmail()
  email: string;

  @IsString()
  @MinLength(8)
  password: string;

  @IsEnum(RoleEnum, { each: true })
  roles: RoleEnum[];

  @IsString()
  @IsOptional()
  firstName?: string;

  @IsString()
  @IsOptional()
  middleName?: string;

  @IsString()
  @IsOptional()
  lastName?: string;

  @IsDateString()
  @IsOptional()
  birthdate?: string;

  @IsPhoneNumber()
  @IsOptional()
  workPhone?: string;

  @Type(() => Branch)
  @ValidateNested({ each: true })
  @IsArray()
  @IsOptional()
  branches?: Branch[];

  @Type(() => Passport)
  @ValidateNested()
  @IsOptional()
  passport?: Passport;

  @Type(() => Location)
  @ValidateNested()
  @IsOptional()
  location?: Location;
}
