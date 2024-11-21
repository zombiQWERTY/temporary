import { TokenDto } from './token.dto';
import { RoleEnum } from '@erp-modul/shared';
import { Role, UsersOnBranch } from '../../../../prisma/client';

export class TokensResponseDto {
  constructor(partial: Partial<TokensResponseDto>) {
    Object.assign(this, partial);
  }

  mainRole: RoleEnum;
  mainBranchId: number | 'ALL';
  userId: number;
  roles: Role[];
  branches: UsersOnBranch[];
  accessToken: TokenDto;
  refreshToken: TokenDto;
}
