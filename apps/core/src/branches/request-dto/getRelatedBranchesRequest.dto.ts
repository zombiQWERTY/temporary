import { IsEnum, IsOptional, IsPositive } from 'class-validator';
import { RoleEnum } from '@erp-modul/shared';

export class GetRelatedBranchesRequestDto {
  @IsPositive()
  userId: number;

  @IsEnum(RoleEnum)
  @IsOptional()
  userRole: RoleEnum;
}
