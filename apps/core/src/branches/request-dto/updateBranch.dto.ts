import {
  IsEmail,
  IsInt,
  IsOptional,
  IsString,
  MaxLength,
} from 'class-validator';

export class UpdateBranchDto {
  @IsString()
  @IsOptional()
  @MaxLength(100)
  branchName?: string;

  @IsOptional()
  @IsString({ each: true })
  countryCodes?: string[];

  @IsInt()
  @IsOptional()
  headOfBranchId?: number;

  @IsString()
  @IsOptional()
  @MaxLength(200)
  address?: string;

  @IsString()
  @IsOptional()
  @MaxLength(15)
  phoneNumber?: string;

  @IsEmail()
  @IsOptional()
  email?: string;
}
