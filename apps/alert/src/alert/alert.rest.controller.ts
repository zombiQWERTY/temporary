import { Body, Controller, Post } from '@nestjs/common';

import { AlertService } from './alert.service';
import { SendSmsCodeRequestDto } from './request-dto/sendSmsCodeRequest.dto';
import { SendCodeResponseDto } from './response-dto/sendCodeResponse.dto';
import { SendEmailCodeRequestDto } from './request-dto/sendEmailCodeRequest.dto';
import { GetMetaParams, UserMetadataParams } from '@erp-modul/shared';

@Controller('alert')
export class AlertRestController {
  constructor(private readonly alertService: AlertService) {}

  @Post('send-sms-code')
  sendSmsCode(
    @Body() dto: SendSmsCodeRequestDto,
    @GetMetaParams() meta: UserMetadataParams,
  ): Promise<SendCodeResponseDto> {
    return this.alertService.sendOtpBySms({
      phone: dto.phone,
      type: dto.type,
      userId: meta?.userId,
      context: 'http',
    });
  }

  @Post('send-email-code')
  sendEmailCode(
    @Body() dto: SendEmailCodeRequestDto,
    @GetMetaParams() meta: UserMetadataParams,
  ): Promise<SendCodeResponseDto> {
    return this.alertService.sendOtpByEmail({
      email: dto.email,
      type: dto.type,
      userId: meta?.userId,
      context: 'http',
    });
  }
}
