import { ExecutionContext } from '@nestjs/common';
import { GetMetaParamsFactory, RoleEnum } from '@erp-modul/shared';

describe('GetMetaParamsFactory', () => {
  const mockRequest = {
    headers: {
      'x-auth-id': '123',
      'x-user-id': '321',
      'x-branch-id': '1',
      'x-auth-role': RoleEnum.Client,
      'x-auth-host-id': '456',
      'x-branch-host-id': '2',
      'x-user-host-id': '654',
      'x-auth-host-role': RoleEnum.Admin,
    },
  };

  const mockExecutionContext: ExecutionContext = {
    switchToHttp: () => ({
      getRequest: () => mockRequest,
    }),
    getClass: jest.fn(),
    getHandler: jest.fn(),
    getType: jest.fn(),
    getArgs: jest.fn(),
  } as unknown as ExecutionContext;

  it('should extract IDs and role without useHost', () => {
    const result = GetMetaParamsFactory({}, mockExecutionContext);
    expect(result).toEqual({
      authId: 123,
      userId: 321,
      branchId: 1,
      role: RoleEnum.Client,
    });
  });

  it('should extract host IDs and role with useHost', () => {
    const result = GetMetaParamsFactory(
      { useHost: true },
      mockExecutionContext,
    );
    expect(result).toEqual({
      authId: 456,
      userId: 654,
      branchId: 2,
      role: RoleEnum.Admin,
    });
  });

  it('should handle non-numeric IDs gracefully', () => {
    mockRequest.headers['x-auth-id'] = 'abc';
    mockRequest.headers['x-user-id'] = 'def';
    mockRequest.headers['x-branch-id'] = 'def';

    const result = GetMetaParamsFactory({}, mockExecutionContext);
    expect(result).toEqual({
      authId: NaN,
      userId: NaN,
      branchId: NaN,
      role: RoleEnum.Client,
    });
  });
});
