import {
  IsArray,
  IsDateString,
  IsEmail,
  IsEnum,
  IsOptional,
  IsPhoneNumber,
  IsString,
  ValidateNested,
} from 'class-validator';
import { Type } from 'class-transformer';
import { RoleEnum } from '@erp-modul/shared';
import { Branch } from './common/branchRequest.dto';
import { Passport } from './common/passportRequest.dto';
import { Location } from './common/locationRequest.dto';
import { Economic } from './common/economicRequest.dto';
import { Tax } from './common/taxRequest.dto';

export class UpdateMyProfileRequestDto {
  @IsEnum(RoleEnum, { each: true })
  @IsOptional()
  roles?: RoleEnum[];

  @Type(() => Branch)
  @IsArray()
  @ValidateNested({ each: true })
  @IsOptional()
  branches?: Branch[];

  @IsPhoneNumber()
  @IsOptional()
  phone?: string;

  @IsEmail()
  @IsOptional()
  email?: string;

  @IsString()
  @IsOptional()
  password?: string;

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

  @Type(() => Passport)
  @ValidateNested()
  @IsOptional()
  passport?: Passport;

  @Type(() => Location)
  @ValidateNested()
  @IsOptional()
  location?: Location;

  @Type(() => Economic)
  @ValidateNested()
  @IsOptional()
  economicProfile?: Economic;

  @Type(() => Tax)
  @ValidateNested()
  @IsOptional()
  taxPayerProfile?: Tax;
}
