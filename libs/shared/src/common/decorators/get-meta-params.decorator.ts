import { createParamDecorator, ExecutionContext } from '@nestjs/common';
import { UserMetadataParams } from '@erp-modul/shared/services';

export const GetMetaParamsFactory = (
  params: { useHost?: boolean },
  ctx: ExecutionContext,
): UserMetadataParams => {
  const req = ctx.switchToHttp().getRequest();

  if (params?.useHost) {
    return {
      authId: parseInt(req.headers['x-auth-host-id'], 10),
      userId: parseInt(req.headers['x-user-host-id'], 10),
      branchId: parseInt(req.headers['x-branch-host-id'], 10),
      role: req.headers['x-auth-host-role'],
    };
  } else {
    return {
      authId: parseInt(req.headers['x-auth-id'], 10),
      userId: parseInt(req.headers['x-user-id'], 10),
      branchId: parseInt(req.headers['x-branch-id'], 10),
      role: req.headers['x-auth-role'],
    };
  }
};

export const GetMetaParams = createParamDecorator(GetMetaParamsFactory);
