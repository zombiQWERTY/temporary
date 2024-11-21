import { BranchesService } from '../branches.service';
import { Test, TestingModule } from '@nestjs/testing';
import { Branch, UsersOnBranch } from '../../../prisma/client';
import { DeepMockProxy, mockDeep } from 'jest-mock-extended';
import { BadRequestException } from '@nestjs/common';
import * as R from 'ramda';
import { Country } from 'country-list-js';

import { UpdateBranchDto } from '../request-dto/updateBranch.dto';
import { CreateBranchDto } from '../request-dto/createBranch.dto';
import { PrismaService } from '../../services/prisma.service';
import { RoleEnum, UserMetadataParams } from '@erp-modul/shared';
import { PrismaClient } from '@prisma/client';
import { CountriesService } from '../../countries/countries.service';

const META: UserMetadataParams = {
  userId: 1,
  authId: 1,
  branchId: 1,
  role: RoleEnum.Admin,
};

const BRANCH: Branch & {
  users: Array<{
    userId: number;
    userRole: RoleEnum;
    branchId: number;
    isHeadOfBranch: boolean;
  }>;
  countries: Array<{
    branchId: number;
    countryCode: string;
  }>;
} = {
  id: 1,
  branchName: 'Branch',
  email: null,
  address: null,
  phoneNumber: null,
  countries: [
    {
      countryCode: 'US',
      branchId: 1,
    },
  ],
  users: [
    {
      userId: 1,
      userRole: RoleEnum.HeadOfBranch,
      branchId: 1,
      isHeadOfBranch: true,
    },
  ],
};

describe('BranchesService', () => {
  let branchesService: BranchesService;
  let prismaMock: DeepMockProxy<PrismaClient>;
  let countriesServiceMock: DeepMockProxy<CountriesService>;

  beforeEach(async () => {
    prismaMock = mockDeep<PrismaClient>();

    const module: TestingModule = await Test.createTestingModule({
      providers: [
        BranchesService,
        { provide: CountriesService, useValue: mockDeep<CountriesService>() },
        {
          provide: PrismaService,
          useValue: prismaMock,
        },
      ],
    }).compile();

    branchesService = module.get<BranchesService>(BranchesService);
    countriesServiceMock = module.get(CountriesService);
  });

  afterEach(() => {
    jest.clearAllMocks();
  });

  it('should be defined', () => {
    expect(branchesService).toBeDefined();
  });

  describe('create', () => {
    it('should create a branch if the user has the right role', async () => {
      const dto: CreateBranchDto = {
        branchName: 'Branch',
        headOfBranchId: 1,
        countryCodes: ['US'],
      };

      prismaMock.branch.create.mockResolvedValueOnce(BRANCH);

      branchesService.checkAuthForUser = jest.fn().mockResolvedValue(void 0);

      countriesServiceMock.findCountryByCountryCode.mockReturnValue([
        'US',
        { name: 'United States' } as Country,
      ]);

      const result = await branchesService.create(dto);

      expect(result).toEqual(BRANCH);
      expect(prismaMock.branch.create).toHaveBeenCalledWith({
        data: {
          branchName: dto.branchName,
          countries: {
            createMany: {
              data: dto.countryCodes.map((c) => ({ countryCode: c })),
            },
          },
          users: {
            create: {
              userId: dto.headOfBranchId,
              userRole: RoleEnum.HeadOfBranch,
              isHeadOfBranch: true,
            },
          },
        },
      });
    });

    it('should throw an error if the user role does not match', async () => {
      const dto: CreateBranchDto = {
        branchName: 'Branch',
        headOfBranchId: 2,
        countryCodes: ['US'],
      };

      prismaMock.rolesOnAuth.findFirst.mockResolvedValue(null);

      await expect(branchesService.create(dto)).rejects.toThrow(
        BadRequestException,
      );
    });
  });

  describe('findAll', () => {
    it('should return all branches', async () => {
      const branches = [BRANCH];

      prismaMock.branch.findMany.mockResolvedValueOnce(branches);

      const result = await branchesService.findAll(0);

      expect(result).toEqual(
        branches.map(({ users, ...b }) => ({
          ...b,
          headOfBranchId: users[0].userId,
        })),
      );
      expect(prismaMock.branch.findMany).toHaveBeenCalled();
    });
  });

  describe('findOne', () => {
    it('should return a specific branch', async () => {
      prismaMock.branch.findUnique.mockResolvedValueOnce(BRANCH);

      const result = await branchesService.findOne(META, 1);

      expect(result).toEqual({
        ...R.omit(['users'], BRANCH),
        headOfBranchId: BRANCH.users[0].userId,
      });

      expect(prismaMock.branch.findUnique).toHaveBeenCalledWith({
        where: { id: 1 },
        include: {
          countries: true,
          users: {
            include: {
              user: {
                select: {
                  id: true,
                  firstName: true,
                  lastName: true,
                  middleName: true,
                },
              },
            },
            where: {
              OR: [{ isHeadOfBranch: true }, { userRole: 'headOfBranch' }],
            },
          },
        },
      });
    });

    it('should throw a BadRequestException if the branch does not exist', async () => {
      prismaMock.branch.findUnique.mockResolvedValue(null);

      await expect(branchesService.findOne(META, BRANCH.id)).rejects.toThrow(
        BadRequestException,
      );
    });
  });

  describe('update', () => {
    it('should update a branch if the user has the right role', async () => {
      const dto: UpdateBranchDto = {
        branchName: 'Updated Branch',
        headOfBranchId: 2,
        countryCodes: ['CA'],
      };

      prismaMock.branch.update.mockResolvedValueOnce({ ...BRANCH, ...dto });
      prismaMock.branch.findUnique.mockResolvedValueOnce(BRANCH);

      branchesService.checkAuthForUser = jest.fn().mockResolvedValue(void 0);

      countriesServiceMock.findCountryByCountryCode.mockReturnValue([
        'CA',
        { name: 'CA' } as Country,
      ]);

      const result = await branchesService.update(META, 1, dto);

      expect(result).toEqual({ ...BRANCH, ...dto });
      expect(prismaMock.branch.update).toHaveBeenCalledWith({
        where: { id: 1 },
        data: {
          ...R.omit(['headOfBranchId', 'countryCodes'], dto),
          countries: {
            deleteMany: {
              countryCode: {
                in: dto.countryCodes,
              },
              branchId: 1,
            },
            createMany: {
              data: dto.countryCodes.map((c) => ({ countryCode: c })),
            },
          },
          users: {
            delete: {
              // isHeadOfBranch: true,
              branchId_userId_userRole: {
                branchId: BRANCH.id,
                userId: BRANCH.users[0].userId,
                userRole: RoleEnum.HeadOfBranch,
              },
            },
            create: {
              userId: dto.headOfBranchId,
              userRole: RoleEnum.HeadOfBranch,
              isHeadOfBranch: true,
            },
          },
        },
      });
    });

    it('should throw a BadRequestException if the user and headOfBranch do not match', async () => {
      const dto: UpdateBranchDto = {
        branchName: 'Updated Branch',
        headOfBranchId: 1,
        countryCodes: ['CA'],
      };

      prismaMock.branch.findUnique.mockResolvedValue(BRANCH);

      await expect(
        branchesService.update(
          { ...META, role: RoleEnum.HeadOfBranch, userId: 2 },
          BRANCH.id,
          dto,
        ),
      ).rejects.toThrow(BadRequestException);
    });

    it('should throw a BadRequestException if the branch does not exist', async () => {
      const dto: UpdateBranchDto = {
        branchName: 'Updated Branch',
        headOfBranchId: 1,
        countryCodes: ['CA'],
      };

      prismaMock.branch.findUnique.mockResolvedValue(null);

      await expect(
        branchesService.update(META, BRANCH.id, dto),
      ).rejects.toThrow(BadRequestException);
    });
  });

  describe('findOneIfPossible', () => {
    it('should return a branch if it exists and the user has the correct role', async () => {
      prismaMock.branch.findUnique.mockResolvedValue(BRANCH);

      const result = await branchesService.findOneIfPossible(1, META);

      expect(result).toEqual(BRANCH);
    });

    it('should throw BadRequestException if the branch does not exist', async () => {
      prismaMock.branch.findUnique.mockResolvedValue(null);

      await expect(branchesService.findOneIfPossible(1, META)).rejects.toThrow(
        BadRequestException,
      );
    });
  });

  describe('getRelatedBranches', () => {
    const userId = 1;

    it('should retrieve branches for the user with admin role', async () => {
      const userRole = RoleEnum.Admin;

      const branches: UsersOnBranch[] = [
        { branchId: 1, isHeadOfBranch: true, userId, userRole },
        { branchId: 2, isHeadOfBranch: false, userId, userRole },
      ];

      prismaMock.usersOnBranch.findMany.mockResolvedValueOnce(branches);

      const result = await branchesService.getRelatedBranches(userId, userRole);

      expect(result).toEqual({
        mainBranchId: 'ALL',
        branches,
      });
      expect(prismaMock.usersOnBranch.findMany).toHaveBeenCalledWith({
        where: { userId },
      });
    });

    it('should retrieve branches for the user with non-admin role', async () => {
      const userRole = RoleEnum.Client;

      const branches: UsersOnBranch[] = [
        { branchId: 1, isHeadOfBranch: true, userId, userRole },
        { branchId: 2, isHeadOfBranch: false, userId, userRole },
      ];

      prismaMock.usersOnBranch.findMany.mockResolvedValueOnce(branches);

      const result = await branchesService.getRelatedBranches(userId, userRole);

      expect(result).toEqual({
        mainBranchId: 1,
        branches,
      });
      expect(prismaMock.usersOnBranch.findMany).toHaveBeenCalledWith({
        where: { userId },
      });
    });

    it('should return default values for user with no branches', async () => {
      const userRole = RoleEnum.Client;
      prismaMock.usersOnBranch.findMany.mockResolvedValueOnce([]);

      const result = await branchesService.getRelatedBranches(userId, userRole);

      expect(result).toEqual({
        mainBranchId: null,
        branches: [],
      });
      expect(prismaMock.usersOnBranch.findMany).toHaveBeenCalledWith({
        where: { userId },
      });
    });
  });

  describe('addUserToBranches', () => {
    const userId = 3;
    const branches = [
      { branchId: 1, role: RoleEnum.BranchManager },
      { branchId: 2, role: RoleEnum.Trustee },
    ];

    it('should add user to branches and return the count of added entries', async () => {
      prismaMock.$transaction.mockImplementation(
        async (transactionCallback) => {
          return transactionCallback({
            usersOnBranch: {
              deleteMany: jest.fn().mockResolvedValue({ count: 0 }),
              createMany: jest.fn().mockResolvedValue({ count: 2 }),
            },
          });
        },
      );

      const result = await branchesService.addUserToBranches({
        userId,
        branches,
      });

      expect(result).toEqual(2);
      expect(prismaMock.$transaction).toHaveBeenCalled();
    });

    it('should handle exceptions when transaction fails', async () => {
      prismaMock.$transaction.mockRejectedValue(
        new Error('Transaction failed'),
      );

      await expect(
        branchesService.addUserToBranches({ userId, branches }),
      ).rejects.toThrow('Transaction failed');
    });
  });

  describe('removeUserFromBranches', () => {
    const userId = 3;
    const branches = [
      { branchId: 1, role: RoleEnum.BranchManager },
      { branchId: 2, role: RoleEnum.Trustee },
    ];

    it('should remove user from branches', async () => {
      prismaMock.$transaction.mockResolvedValueOnce(undefined);

      await branchesService.removeUserFromBranches(userId, branches);

      expect(prismaMock.$transaction).toHaveBeenCalled();
      expect(prismaMock.usersOnBranch.delete).toHaveBeenCalledTimes(2);
      expect(prismaMock.usersOnBranch.delete.mock.calls[0][0].where).toEqual({
        branchId_userId_userRole: {
          userId: 3,
          branchId: 1,
          userRole: RoleEnum.BranchManager,
        },
      });
      expect(prismaMock.usersOnBranch.delete.mock.calls[1][0].where).toEqual({
        branchId_userId_userRole: {
          userId: 3,
          branchId: 2,
          userRole: RoleEnum.Trustee,
        },
      });
    });

    it('should handle exceptions when transaction fails', async () => {
      prismaMock.$transaction.mockRejectedValue(
        new Error('Transaction failed'),
      );

      await expect(
        branchesService.removeUserFromBranches(userId, branches),
      ).rejects.toThrow('Transaction failed');
    });
  });

  describe('addUserToBranchesByParams', () => {
    const userId = 1;
    const roles = [RoleEnum.Client];
    const branchId = 1;
    const countryCode = 'US';

    it('should create new user roles on branch when they do not exist', async () => {
      const params = { userId, roles, branchId };
      prismaMock.$transaction.mockImplementation(
        async (callback) => await callback(prismaMock),
      );
      prismaMock.branch.findFirst.mockResolvedValueOnce({
        id: branchId,
        countryCode: 'US',
      });
      prismaMock.usersOnBranch.findUnique.mockResolvedValue(null);
      prismaMock.usersOnBranch.create.mockResolvedValueOnce({ id: 1 });

      await branchesService.addUserToBranchesByParams(params);

      expect(prismaMock.usersOnBranch.create).toHaveBeenCalledTimes(
        roles.length,
      );
      roles.forEach((role, index) => {
        expect(prismaMock.usersOnBranch.create).toHaveBeenNthCalledWith(
          index + 1,
          {
            data: {
              branchId,
              userId,
              userRole: role,
            },
          },
        );
      });
    });

    it('should not create new user roles when they already exist', async () => {
      const params = { userId, roles, branchId };
      prismaMock.branch.findFirst.mockResolvedValueOnce({
        id: branchId,
        countryCode: 'US',
      });
      prismaMock.usersOnBranch.findUnique.mockResolvedValue({ id: 1 });

      await branchesService.addUserToBranchesByParams(params);

      expect(prismaMock.usersOnBranch.create).not.toHaveBeenCalled();
    });

    it('should handle the case when no branch is found', async () => {
      const params = { userId, roles, countryCode };
      prismaMock.branch.findFirst.mockResolvedValue(null);

      await branchesService.addUserToBranchesByParams(params);

      expect(prismaMock.usersOnBranch.create).not.toHaveBeenCalled();
    });
  });
});
