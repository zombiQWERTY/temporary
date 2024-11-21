import { IsEnum, IsPositive } from 'class-validator';
import { RoleEnum } from '@erp-modul/shared';

export class GetRelatedUsersRequestDto {
  @IsPositive()
  branchId: number;

  @IsEnum(RoleEnum, { each: true })
  userRoles: RoleEnum[];
}
