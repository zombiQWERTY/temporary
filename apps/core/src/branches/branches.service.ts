import { BadRequestException, Injectable } from '@nestjs/common';

import {
  Branch,
  User,
  Prisma,
  PrismaClient,
  UsersOnBranch,
} from '../../prisma/client';
import { PrismaService } from '../services/prisma.service';
import { CreateBranchDto } from './request-dto/createBranch.dto';
import { UpdateBranchDto } from './request-dto/updateBranch.dto';
import { RoleEnum, UserMetadataParams } from '@erp-modul/shared';
import { CountriesService } from '../countries/countries.service';

type PrismaTransactionalClient = Prisma.TransactionClient | PrismaClient;

@Injectable()
export class BranchesService {
  constructor(
    private prisma: PrismaService,
    private countriesService: CountriesService,
  ) {}

  async create({
    headOfBranchId,
    countryCodes,
    ...dto
  }: CreateBranchDto): Promise<Branch> {
    await this.checkAuthForUser(headOfBranchId, RoleEnum.HeadOfBranch);

    const countryCodesToSet = countryCodes.map((c) => {
      const [countryCode] = this.countriesService.findCountryByCountryCode(c);

      return { countryCode };
    });

    return this.prisma.branch.create({
      data: {
        ...dto,
        countries: {
          createMany: {
            data: countryCodesToSet,
          },
        },
        users: {
          create: {
            userId: headOfBranchId,
            userRole: RoleEnum.HeadOfBranch,
            isHeadOfBranch: true,
          },
        },
      },
    });
  }

  async findAll(skip: number, take = 20) {
    // @TODO: check if user can see list of branches
    const branches = await this.prisma.branch.findMany({
      skip,
      take,
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
            isHeadOfBranch: true,
          },
        },
      },
    });

    return branches.map(({ users, ...b }) => ({
      ...b,
      headOfBranchId: users?.[0]?.userId,
      headOfBranch: users?.[0]?.user,
    }));
  }

  search({
    skip,
    take = 20,
    term,
    branchId,
  }: {
    skip: number;
    take: number;
    term: string;
    branchId: number;
  }) {
    const makeSearch = (field: string, term: string) => {
      return term ? { [field]: { contains: term, mode: 'insensitive' } } : null;
    };

    const fieldSearchConditions = ['firstName', 'middleName', 'lastName']
      .map((field) => makeSearch(field, term))
      .filter(Boolean);

    return this.prisma.branch.findMany({
      skip,
      take,
      where: {
        id: branchId,
        ...fieldSearchConditions,
      },
      select: {
        id: true,
        branchName: true,
      },
    });
  }

  async findOne(
    meta: UserMetadataParams,
    id: number,
  ): Promise<
    Branch & {
      headOfBranchId: number;
      headOfBranch: Pick<User, 'id' | 'firstName' | 'lastName' | 'middleName'>;
    }
  > {
    const { users, ...branch } = await this.findOneIfPossible(id, meta);

    return {
      ...branch,
      headOfBranchId: users?.[0]?.userId,
      headOfBranch: users?.[0]?.user,
    };
  }

  async update(
    meta: UserMetadataParams,
    id: number,
    { headOfBranchId, countryCodes, ...dto }: UpdateBranchDto,
  ): Promise<Branch> {
    const branchRecord = await this.findOneIfPossible(id, meta);

    if (headOfBranchId && meta.role === RoleEnum.Admin) {
      await this.checkAuthForUser(headOfBranchId, RoleEnum.HeadOfBranch);

      const prevHeadOfBranch = branchRecord.users.find(
        (el) => el.userRole === RoleEnum.HeadOfBranch,
        // (el) => el.isHeadOfBranch,
      );

      const countryCodesToSet = countryCodes.map((c) => {
        const [countryCode] = this.countriesService.findCountryByCountryCode(c);

        return { countryCode };
      });

      return this.prisma.branch.update({
        where: { id },
        data: {
          ...dto,
          countries: {
            deleteMany: {
              countryCode: {
                in: countryCodesToSet.map((c) => c.countryCode),
              },
              branchId: branchRecord.id,
            },
            createMany: {
              data: countryCodesToSet,
            },
          },
          users: {
            delete: {
              // isHeadOfBranch: true,
              branchId_userId_userRole: {
                branchId: id,
                userId: prevHeadOfBranch?.userId,
                userRole: RoleEnum.HeadOfBranch,
              },
            },
            create: {
              userId: headOfBranchId,
              userRole: RoleEnum.HeadOfBranch,
              isHeadOfBranch: true,
            },
          },
        },
      });
    }

    if (meta.role !== RoleEnum.HeadOfBranch) {
      throw new BadRequestException(`You must be Head of Branch`);
    }

    return this.prisma.branch.update({
      where: { id },
      data: dto,
    });
  }

  async findOneIfPossible(branchId: number, meta: UserMetadataParams) {
    const branch = await this.prisma.branch.findUnique({
      where: { id: branchId },
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
            // isHeadOfBranch: true,
            OR: [{ isHeadOfBranch: true }, { userRole: RoleEnum.HeadOfBranch }],
          },
        },
      },
    });

    if (!branch) {
      throw new BadRequestException(`Branch with ID ${branchId} not found`);
    }

    const currentHeadOfBranch = branch.users.find(
      (el) =>
        el.isHeadOfBranch &&
        meta.userId === el.userId &&
        el.userRole === RoleEnum.HeadOfBranch,
    );

    if (meta.role !== RoleEnum.Admin && !currentHeadOfBranch) {
      throw new BadRequestException(`Can not access to foreign branch`);
    }

    return branch;
  }

  async getRelatedBranches(
    userId: number,
    userRole?: RoleEnum,
  ): Promise<{ mainBranchId: number | 'ALL'; branches: UsersOnBranch[] }> {
    const branches = await this.prisma.usersOnBranch.findMany({
      where: {
        userId,
      },
    });

    if (!branches.length) {
      return {
        mainBranchId: userRole === RoleEnum.Admin ? ('ALL' as const) : null,
        branches: [],
      };
    }

    const mainBranch = branches.find((b) => b.isHeadOfBranch) || branches[0];

    return {
      mainBranchId:
        userRole === RoleEnum.Admin ? ('ALL' as const) : mainBranch.branchId,
      branches,
    };
  }

  async checkAuthForUser(userId: number, role: RoleEnum) {
    const authOnRole = await this.prisma.rolesOnAuth.findFirst({
      where: {
        role: {
          slug: role,
        },
        auth: {
          userId,
        },
      },
    });

    if (!authOnRole) {
      throw new BadRequestException(
        `${role} with userId ${userId} does not exist`,
      );
    }
  }

  async addUserToBranches(params: {
    tx?: PrismaTransactionalClient;
    userId: number;
    branches: { branchId: number; role: RoleEnum }[];
  }) {
    const transaction = params.tx
      ? (cb: (tx: PrismaTransactionalClient) => Promise<{ count: number }>) =>
          cb(params.tx)
      : (cb: (tx: PrismaTransactionalClient) => Promise<{ count: number }>) =>
          this.prisma.$transaction((tx) => cb(tx));

    const createData = params.branches.map((b) => ({
      branchId: b.branchId,
      userId: params.userId,
      userRole: b.role,
    }));

    const t = await transaction(async (tx) => {
      await tx.usersOnBranch.deleteMany({ where: { userId: params.userId } });
      return tx.usersOnBranch.createMany({ data: createData });
    });

    return t.count;
  }

  async addUserToBranchesByParams(params: {
    tx?: PrismaTransactionalClient;
    userId: number;
    roles: RoleEnum[];
    branchId?: number;
    countryCode?: string;
  }) {
    const transaction = params.tx
      ? (cb: (tx: PrismaTransactionalClient) => Promise<void>) => cb(params.tx)
      : (cb: (tx: PrismaTransactionalClient) => Promise<void>) =>
          this.prisma.$transaction((tx) => cb(tx));

    await transaction(async (tx) => {
      const foundBranch = await tx.branch.findFirst({
        where: {
          OR: [
            {
              id: params.branchId || undefined,
            },
            {
              countries: {
                some: {
                  countryCode: params.countryCode || undefined,
                },
              },
            },
          ],
        },
      });

      if (foundBranch) {
        const branchAssociationsPromises = params.roles.map(async (role) => {
          const existingAssociation = await tx.usersOnBranch.findUnique({
            where: {
              branchId_userId_userRole: {
                branchId: foundBranch.id,
                userId: params.userId,
                userRole: role,
              },
            },
          });

          if (!existingAssociation) {
            return tx.usersOnBranch.create({
              data: {
                branchId: foundBranch.id,
                userId: params.userId,
                userRole: role,
              },
            });
          }
          return Promise.resolve();
        });

        await Promise.all(branchAssociationsPromises);
      }
    });
  }

  async removeUserFromBranches(
    userId: number,
    branches: { branchId: number; role: RoleEnum }[],
  ) {
    const deletePromises = branches.map((branch) => {
      return this.prisma.usersOnBranch.delete({
        where: {
          branchId_userId_userRole: {
            userId,
            branchId: branch.branchId,
            userRole: branch.role,
          },
        },
      });
    });

    await this.prisma.$transaction(deletePromises);
  }
}
