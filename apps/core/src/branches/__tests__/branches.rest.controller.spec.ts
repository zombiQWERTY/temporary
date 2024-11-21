import { BranchesRestController } from '../branches.rest.controller';
import { BranchesService } from '../branches.service';
import { Test } from '@nestjs/testing';
import { DeepMockProxy, mockDeep } from 'jest-mock-extended';
import { CreateBranchDto } from '../request-dto/createBranch.dto';
import { RoleEnum, UserMetadataParams } from '@erp-modul/shared';
import { Branch } from '../../../prisma/client';

const META: UserMetadataParams = {
  userId: 1,
  authId: 1,
  branchId: 1,
  role: RoleEnum.Admin,
};

describe('BranchesRestController', () => {
  let branchesRestController: BranchesRestController;
  let branchesService: DeepMockProxy<BranchesService>;

  beforeEach(async () => {
    branchesService = mockDeep<BranchesService>();

    const moduleRef = await Test.createTestingModule({
      controllers: [BranchesRestController],
      providers: [
        {
          provide: BranchesService,
          useValue: branchesService,
        },
      ],
    }).compile();

    branchesRestController = moduleRef.get<BranchesRestController>(
      BranchesRestController,
    );
  });

  describe('POST /branches', () => {
    it('should create a branch', async () => {
      const createBranchDto: CreateBranchDto = {
        branchName: 'New Branch',
        headOfBranchId: 1,
        countryCodes: ['gr'],
      };

      const expected: Branch = {
        ...createBranchDto,
        id: 1,
        email: undefined,
        address: undefined,
        phoneNumber: undefined,
      };

      branchesService.create.mockResolvedValue(expected);

      const result = await branchesRestController.create(createBranchDto);

      expect(result).toEqual(expected);
      expect(branchesService.create).toHaveBeenCalledWith(createBranchDto);
    });
  });

  describe('GET /branches', () => {
    it('should return all branches', async () => {
      const branches: Array<
        Branch & {
          headOfBranchId: number;
          headOfBranch: {
            id: number;
            firstName: string;
            lastName: string;
            middleName: string;
          };
          countries: { branchId: number; countryCode: string }[];
        }
      > = [
        {
          id: 1,
          branchName: 'Main Branch',
          headOfBranchId: 1,
          headOfBranch: {
            id: 1,
            firstName: 'string',
            lastName: 'string',
            middleName: 'string',
          },
          email: 'info@mainbranch.com',
          address: '123 Main St',
          phoneNumber: '1234567890',
          countries: [
            {
              branchId: 1,
              countryCode: 'us',
            },
          ],
        },
      ];

      branchesService.findAll.mockResolvedValue(branches);

      const result = await branchesRestController.findAll();

      expect(result).toEqual({ list: branches, take: 20, skip: 0 });
      expect(branchesService.findAll).toHaveBeenCalled();
    });
  });

  describe('GET /branches/:id', () => {
    it('should return a single branch', async () => {
      const branch: Branch & {
        headOfBranchId: number;
        headOfBranch: {
          id: number;
          firstName: string;
          lastName: string;
          middleName: string;
        };
        countries: { countryCode: string }[];
      } = {
        id: 1,
        branchName: 'Main Branch',
        headOfBranch: {
          id: 1,
          firstName: 'string',
          lastName: 'string',
          middleName: 'string',
        },
        headOfBranchId: 1,
        email: 'info@mainbranch.com',
        address: '123 Main St',
        phoneNumber: '1234567890',
        countries: [
          {
            countryCode: 'us',
          },
        ],
      };

      branchesService.findOne.mockResolvedValue(branch);

      const result = await branchesRestController.findOne(META, 1);

      expect(result).toEqual(branch);
      expect(branchesService.findOne).toHaveBeenCalledWith(META, 1);
    });
  });

  describe('PUT /branches/:id', () => {
    it('should update a branch', async () => {
      const updateBranchDto = {
        branchName: 'Updated Branch',
        headOfBranchId: 2,
        countryCodes: ['uk'],
        email: 'contact@updatedbranch.com',
        address: '321 Updated St',
        phoneNumber: '0987654321',
      };

      const updatedBranch: Branch = {
        id: 1,
        ...updateBranchDto,
      };

      branchesService.update.mockResolvedValue(updatedBranch);

      const result = await branchesRestController.update(
        META,
        1,
        updateBranchDto,
      );

      expect(result).toEqual(updatedBranch);
      expect(branchesService.update).toHaveBeenCalledWith(
        META,
        1,
        updateBranchDto,
      );
    });
  });
});
