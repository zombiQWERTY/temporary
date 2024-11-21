import { Test } from '@nestjs/testing';
import { DeepMockProxy, mockDeep } from 'jest-mock-extended';
import { EventTypeEnum, OutcomeEnum } from '@erp-modul/shared/dto/auditLog';
import { RoleEnum } from '@erp-modul/shared';

import { AuditRmqController } from '../audit.rmq.controller';
import { AuditService } from '../audit.service';
import { RpcException } from '@nestjs/microservices';
import { Logger } from '@nestjs/common';

describe('AuditRmqController', () => {
  let controller: AuditRmqController;
  let auditService: DeepMockProxy<AuditService>;
  let mockLogger: Partial<Logger>;

  const rmqContext = {
    getChannelRef: jest.fn().mockReturnValue({ ack: jest.fn() }),
    getMessage: jest.fn(),
  } as any;

  beforeEach(async () => {
    auditService = mockDeep<AuditService>();

    mockLogger = {
      error: jest.fn(),
    };

    const moduleRef = await Test.createTestingModule({
      controllers: [AuditRmqController],
      providers: [
        {
          provide: AuditService,
          useValue: auditService,
        },
      ],
    }).compile();

    controller = moduleRef.get<AuditRmqController>(AuditRmqController);

    controller['logger'] = mockLogger as Logger;
  });

  afterEach(() => {
    jest.clearAllMocks();
  });

  it('should call auditService.putLog and return success', async () => {
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

    auditService.putLog.mockResolvedValue(undefined);

    const result = await controller.putLog(dto, rmqContext);
    expect(auditService.putLog).toHaveBeenCalledWith(dto);
    expect(rmqContext.getChannelRef().ack).toHaveBeenCalled();
    expect(result).toEqual({ ok: true });
  });

  it('should throw RpcException when auditService.putLog fails', async () => {
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

    const errorMessage = 'Something went wrong';

    auditService.putLog.mockRejectedValue(new Error(errorMessage));

    await expect(controller.putLog(dto, rmqContext)).rejects.toThrow(
      RpcException,
    );
    expect(mockLogger.error).toHaveBeenCalledWith(
      'Can not put audit log. Event stays in queue',
      {
        error: new Error(errorMessage),
        context: { dto },
      },
    );
    expect(rmqContext.getChannelRef().ack).not.toHaveBeenCalled();
  });
});
