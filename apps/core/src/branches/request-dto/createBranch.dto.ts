import {
  IsEmail,
  IsInt,
  IsOptional,
  IsString,
  MaxLength,
} from 'class-validator';

export class CreateBranchDto {
  @IsString()
  @MaxLength(100)
  branchName: string;

  @IsString({ each: true })
  countryCodes: string[];

  @IsInt()
  headOfBranchId: number;

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
