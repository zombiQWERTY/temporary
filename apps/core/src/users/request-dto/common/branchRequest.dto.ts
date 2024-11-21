import { IsEnum, IsPositive } from 'class-validator';
import { RoleEnum } from '@erp-modul/shared';

export class Branch {
  @IsPositive()
  branchId: number;

  @IsEnum(RoleEnum)
  role: RoleEnum;
}
