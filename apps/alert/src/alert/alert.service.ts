import { Inject, Injectable } from '@nestjs/common';

import { OtpTypeEnum } from '../../prisma/client';
import { OtpService, throwException } from '../otp/otp.service';
import { MailService } from '../mail/mail.service';

@Injectable()
export class AlertService {
  constructor(
    private otpService: OtpService,
    @Inject(MailService) private mailService: MailService,
  ) {}

  private unloggedActions: string[] = [
    OtpTypeEnum.SIGN_UP,
    OtpTypeEnum.RESET_PASSWORD,
  ];

  sendOtpBySms(params: {
    phone: string;
    type: OtpTypeEnum;
    userId?: number;
    context: 'http' | 'tcp';
  }) {
    return this.otpService.sendOtpBySms(params);
  }

  sendOtpByEmail(params: {
    email: string;
    type: OtpTypeEnum;
    userId?: number;
    context: 'http' | 'tcp';
  }) {
    return this.otpService.sendOtpByEmail(params);
  }

  verifyOtpBySms(params: {
    phone?: string;
    otp: string;
    type: OtpTypeEnum;
    userId?: number;
    context: 'http' | 'tcp';
  }) {
    if (this.unloggedActions.includes(params.type)) {
      return this.otpService.verifyOtpBySms(params);
    } else {
      if (!params.userId) {
        return throwException(params.context, 'User Id is not provided');
      }

      return this.otpService.verifyOtpBySms(params);
    }
  }

  verifyOtpByEmail(params: {
    email?: string;
    otp: string;
    type: OtpTypeEnum;
    userId?: number;
    context: 'http' | 'tcp';
  }) {
    if (this.unloggedActions.includes(params.type)) {
      return this.otpService.verifyOtpByEmail(params);
    } else {
      if (!params.userId) {
        return throwException(params.context, 'User Id is not provided');
      }

      return this.otpService.verifyOtpByEmail(params);
    }
  }

  async sendEmail(
    email: string,
    subject: string,
    text: string,
    extra?: {
      useHtmlTemplate?: boolean;
      templateId?: string;
      fromBackoffice?: boolean;
      data?: Record<string, any>;
    },
  ) {
    await this.mailService.sendMail({
      to: email,
      subject,
      plainText: text,
      ...extra,
    });

    return { success: true };
  }
}
