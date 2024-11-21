import { Controller } from '@nestjs/common';
import { MessagePattern } from '@nestjs/microservices';

import { AlertService } from './alert.service';
import { SendSmsCodeRequestDto } from './request-dto/sendSmsCodeRequest.dto';
import { SendCodeResponseDto } from './response-dto/sendCodeResponse.dto';
import { ConfirmSmsCodeRequestDto } from './request-dto/confirmSmsCodeRequest.dto';
import { SendEmailCodeRequestDto } from './request-dto/sendEmailCodeRequest.dto';
import { ConfirmEmailCodeRequestDto } from './request-dto/confirmEmailCodeRequest.dto';
import { SendRawEmailRequestDto } from './request-dto/sendRawEmailRequest.dto';

@Controller()
export class AlertTcpController {
  constructor(private readonly alertService: AlertService) {}

  @MessagePattern({ cmd: 'send_otp_by_sms' })
  sendSmsCode(dto: SendSmsCodeRequestDto): Promise<SendCodeResponseDto> {
    return this.alertService.sendOtpBySms({
      phone: dto.phone,
      type: dto.type,
      userId: dto.userId,
      context: 'tcp',
    });
  }

  @MessagePattern({ cmd: 'verify_otp_by_sms' })
  confirmSmsCode(dto: ConfirmSmsCodeRequestDto): Promise<boolean> {
    return this.alertService.verifyOtpBySms({
      phone: dto.phone,
      otp: dto.code,
      type: dto.type,
      userId: dto.userId,
      context: 'tcp',
    });
  }

  @MessagePattern({ cmd: 'send_otp_by_email' })
  sendEmailCode(dto: SendEmailCodeRequestDto): Promise<SendCodeResponseDto> {
    return this.alertService.sendOtpByEmail({
      email: dto.email,
      type: dto.type,
      userId: dto.userId,
      context: 'tcp',
    });
  }

  @MessagePattern({ cmd: 'verify_otp_by_email' })
  confirmEmailCode(dto: ConfirmEmailCodeRequestDto): Promise<boolean> {
    return this.alertService.verifyOtpByEmail({
      email: dto.email,
      otp: dto.code,
      type: dto.type,
      userId: dto.userId,
      context: 'tcp',
    });
  }

  @MessagePattern({ cmd: 'send_raw_email' })
  sendRawEmail(dto: SendRawEmailRequestDto): Promise<{ success: boolean }> {
    return this.alertService.sendEmail(
      dto.email,
      dto.subject,
      dto.text,
      dto.extra,
    );
  }
}
