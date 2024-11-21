import { IsArray, IsEnum, IsPositive, ValidateNested } from 'class-validator';
import { Type } from 'class-transformer';
import { RoleEnum } from '@erp-modul/shared';

export class Branch {
  @IsPositive()
  branchId: number;

  @IsEnum(RoleEnum)
  role: RoleEnum;
}

export class AddUserToBranchesRequestDto {
  @IsPositive()
  userId: number;

  @Type(() => Branch)
  @ValidateNested({ each: true })
  @IsArray()
  branches: Branch[];
}
