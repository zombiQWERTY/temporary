import { Inject, Injectable, Scope } from '@nestjs/common';
import { REQUEST } from '@nestjs/core';
import { RoleEnum } from '@erp-modul/shared';

export interface UserMetadataParams {
  userId: number;
  authId: number;
  branchId: number;
  role: RoleEnum;
}

@Injectable({ scope: Scope.REQUEST })
export class UserMetaService {
  constructor(@Inject(REQUEST) private request: Request) {}

  getUserMeta(params?: { useHost?: boolean }): UserMetadataParams {
    const headerPrefix = params?.useHost ? 'x-*-host' : 'x-*';

    return {
      userId: parseInt(
        this.request.headers[headerPrefix.replace('*', 'user-id')],
        10,
      ),
      authId: parseInt(
        this.request.headers[headerPrefix.replace('*', 'auth-id')],
        10,
      ),
      branchId: parseInt(
        this.request.headers[headerPrefix.replace('*', 'branch-id')],
        10,
      ),
      role: this.request.headers[headerPrefix.replace('*', 'auth-role')],
    };
  }
}
