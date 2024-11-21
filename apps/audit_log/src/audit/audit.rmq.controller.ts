import { Controller, Logger } from '@nestjs/common';
import {
  Ctx,
  MessagePattern,
  Payload,
  RmqContext,
  RpcException,
} from '@nestjs/microservices';
import { AuditLog } from '@erp-modul/shared';

import { AuditService } from './audit.service';

@Controller()
export class AuditRmqController {
  constructor(private readonly auditService: AuditService) {}

  private logger = new Logger(AuditRmqController.name);

  @MessagePattern('put')
  async putLog(
    @Payload() dto: AuditLog.PutLogRequestDto,
    @Ctx() context: RmqContext,
  ) {
    const channel = context.getChannelRef();
    const originalMsg = context.getMessage();

    try {
      await this.auditService.putLog(dto);
    } catch (error) {
      this.logger.error('Can not put audit log. Event stays in queue', {
        error,
        context: { dto },
      });

      throw new RpcException(error.message);
    }

    channel.ack(originalMsg);
    return { ok: true };
  }
}
