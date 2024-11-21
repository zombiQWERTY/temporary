import { Test, TestingModule } from '@nestjs/testing';
import { REQUEST } from '@nestjs/core';
import { RoleEnum, UserMetaService } from '@erp-modul/shared';

describe('UserMetaService', () => {
  let service: UserMetaService;

  const mockRequest = {
    headers: {
      'x-user-id': '100',
      'x-auth-id': '200',
      'x-branch-id': '1',
      'x-auth-role': RoleEnum.Admin,
      'x-user-id-host': '300',
      'x-auth-id-host': '400',
      'x-branch-id-host': '2',
      'x-auth-role-host': RoleEnum.Client,
    },
  };

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      providers: [
        UserMetaService,
        {
          provide: REQUEST,
          useValue: mockRequest,
        },
      ],
    }).compile();

    service = await module.resolve<UserMetaService>(UserMetaService);
  });

  it('should be defined', () => {
    expect(service).toBeDefined();
  });

  it('should fetch user metadata without host', () => {
    const result = service.getUserMeta();
    expect(result).toEqual({
      userId: 100,
      authId: 200,
      branchId: 1,
      role: RoleEnum.Admin,
    });
  });

  it('should fetch user metadata with host', () => {
    const result = service.getUserMeta({ useHost: true });
    expect(result).toEqual({
      userId: 300,
      authId: 400,
      branchId: 2,
      role: RoleEnum.Client,
    });
  });

  it('should handle non-numeric IDs gracefully', () => {
    // Overriding headers for this test case
    mockRequest.headers['x-user-id'] = 'abc'; // Non-numeric value
    mockRequest.headers['x-auth-id'] = 'xyz'; // Non-numeric value
    mockRequest.headers['x-branch-id'] = 'xyz'; // Non-numeric value

    const result = service.getUserMeta();
    expect(result).toEqual({
      userId: NaN, // parseInt will return NaN for non-numeric values
      authId: NaN,
      branchId: NaN,
      role: RoleEnum.Admin,
    });
  });
});
