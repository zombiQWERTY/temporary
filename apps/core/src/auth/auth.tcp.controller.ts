import { Controller } from '@nestjs/common';
import { MessagePattern } from '@nestjs/microservices';

import { AuthCommonService } from './auth.common.service';

@Controller()
export class AuthTcpController {
  constructor(private readonly authCommonService: AuthCommonService) {}

  @MessagePattern({ cmd: 'find_credentials' })
  findCredentials(dto: {
    userId: number;
  }): Promise<{ email: string; phone: string }> {
    return this.authCommonService.findCredentials(dto.userId);
  }
}
