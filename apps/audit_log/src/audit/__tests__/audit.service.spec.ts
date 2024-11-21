import { Test, TestingModule } from '@nestjs/testing';
import { PrismaClient } from '@prisma/client';
import { DeepMockProxy, mockDeep } from 'jest-mock-extended';

import { PrismaService } from '../../services/prisma.service';
import { AuditService } from '../audit.service';
import { EventTypeEnum, OutcomeEnum } from '@erp-modul/shared/dto/auditLog';
import { RoleEnum } from '@erp-modul/shared';

describe('AuditService', () => {
  let auditService: AuditService;
  let prismaMock: DeepMockProxy<PrismaClient>;

  beforeEach(async () => {
    prismaMock = mockDeep<PrismaClient>();

    const module: TestingModule = await Test.createTestingModule({
      providers: [
        AuditService,
        {
          provide: PrismaService,
          useValue: prismaMock,
        },
      ],
    }).compile();

    auditService = module.get<AuditService>(AuditService);
  });

  afterEach(() => {
    jest.clearAllMocks();
  });

  it('should be defined', () => {
    expect(auditService).toBeDefined();
  });

  describe('AuditService: put log', () => {
    it('should successfully create an audit log entry', async () => {
      const dto = {
        resource: 'Auth',
        event: {
          eventType: 'Create' as EventTypeEnum,
          eventDescription: 'User registered',
        },
        outcome: 'Success' as OutcomeEnum,
        user: {
          id: 1,
          role: RoleEnum.Client,
        },
      };

      const createdLog = {
        id: 1,
        ...dto,
      };

      prismaMock.auditLog.create.mockResolvedValue(createdLog);

      const result = await auditService.putLog(dto);
      expect(result).toEqual(createdLog);
      expect(prismaMock.auditLog.create).toHaveBeenCalledWith({ data: dto });
    });
  });
});
