import { IsEnum, IsOptional, IsPositive } from 'class-validator';
import { RoleEnum } from '@erp-modul/shared';

export class SelectMetaRequestDto {
  constructor(partial: Partial<SelectMetaRequestDto>) {
    Object.assign(this, partial);
  }

  @IsEnum(RoleEnum)
  role: RoleEnum;

  @IsPositive()
  @IsOptional()
  branchId?: number;
}
