import { randomInt } from 'crypto';
import { Injectable, Inject, BadRequestException } from '@nestjs/common';
import {
  subMilliseconds,
  addMilliseconds,
  isBefore,
  differenceInMilliseconds,
} from 'date-fns';
import { RpcException } from '@nestjs/microservices';

import { PrismaService } from '../services/prisma.service';
import { OtpTypeEnum } from '../../prisma/client';
import { MailService } from '../mail/mail.service';
import { SMSService } from '../services/sms.service';

const convertExpireAtToMilliseconds = (expiresAt: Date): number => {
  const now = new Date();
  const milliseconds = differenceInMilliseconds(expiresAt, now);

  return milliseconds > 0 ? Math.round(milliseconds) : 0;
};

export const throwException = (context: 'http' | 'tcp', message: string) => {
  if (context === 'http') {
    throw new BadRequestException(message);
  } else {
    throw new RpcException({ code: 400, message });
  }
};

const convertExpireAtToSeconds = (expiresAt: Date): number => {
  const milliseconds = convertExpireAtToMilliseconds(expiresAt);
  return milliseconds > 0 ? Math.round(milliseconds / 1000) : 0;
};

// @TODO: DO NOT USE PROVIDED EMAILS OR PHONES WHEN LOGGED IN. Make call to core service and get them by userId
@Injectable()
export class OtpService {
  constructor(
    private readonly prisma: PrismaService,
    @Inject(MailService) private mailService: MailService,
    @Inject(SMSService) private smsService: SMSService,
  ) {}

  private readonly otpExpiryTime = 5 * 60 * 1000; // 5 minutes
  private readonly otpCooldownTime = 0.5 * 60 * 1000; // 30 seconds

  async sendOtpBySms({
    phone,
    type,
    userId,
    context,
  }: {
    phone: string;
    type: OtpTypeEnum;
    userId?: number;
    context: 'http' | 'tcp';
  }) {
    const cooldownThreshold = subMilliseconds(new Date(), this.otpCooldownTime);

    const existingOtp = await this.prisma.otpBySms.findFirst({
      where: {
        phone,
        type,
        sentAt: {
          gte: cooldownThreshold,
        },
      },
    });

    if (existingOtp) {
      const cooldownTTL = convertExpireAtToSeconds(
        addMilliseconds(existingOtp.sentAt, this.otpCooldownTime),
      );

      return throwException(
        context,
        `OTP already sent, please wait ${cooldownTTL} sec before requesting again.`,
      );
    }

    const otp = this.generateOtp();
    await this.sendOtpViaSms(phone, otp);

    const expiryDate = addMilliseconds(new Date(), this.otpExpiryTime);

    const created = await this.prisma.otpBySms.create({
      data: {
        phone,
        otp,
        type,
        expiresAt: expiryDate,
        userId,
        confirmedAt: null,
      },
    });

    const cooldownTTL = convertExpireAtToMilliseconds(
      addMilliseconds(created.sentAt, this.otpCooldownTime),
    );

    return {
      message: 'OTP sent successfully via SMS',
      code: otp,
      ttl: cooldownTTL,
    };
  }

  async sendOtpByEmail({
    email,
    type,
    userId,
    context,
  }: {
    email: string;
    type: OtpTypeEnum;
    userId?: number;
    context: 'http' | 'tcp';
  }) {
    const cooldownThreshold = subMilliseconds(new Date(), this.otpCooldownTime);

    const existingOtp = await this.prisma.otpByEmail.findFirst({
      where: {
        email,
        type,
        sentAt: {
          gte: cooldownThreshold,
        },
      },
    });

    if (existingOtp) {
      const cooldownTTL = convertExpireAtToSeconds(
        addMilliseconds(existingOtp.sentAt, this.otpCooldownTime),
      );

      return throwException(
        context,
        `OTP already sent, please wait ${cooldownTTL} sec before requesting again.`,
      );
    }

    const otp = this.generateOtp();
    this.sendOtpViaEmail(email, otp);

    const expiryDate = addMilliseconds(new Date(), this.otpExpiryTime);

    const created = await this.prisma.otpByEmail.create({
      data: {
        email,
        otp,
        type,
        expiresAt: expiryDate,
        userId,
        confirmedAt: null,
      },
    });

    const cooldownTTL = convertExpireAtToMilliseconds(
      addMilliseconds(created.sentAt, this.otpCooldownTime),
    );

    return {
      message: 'OTP sent successfully via Email',
      code: otp,
      ttl: cooldownTTL,
    };
  }

  generateOtp(): string {
    return randomInt(100000, 999999).toString();
  }

  private async sendOtpViaSms(phone: string, otp: string) {
    await this.smsService.sendSms(phone, otp);
    return Promise.resolve();
  }

  private sendOtpViaEmail(email: string, otp: string) {
    this.mailService.sendMail({
      to: email,
      data: { code: otp },
      subject: 'Confirmation Code',
      useHtmlTemplate: true,
      templateId: 'confirmationCode',
      plainText: otp,
    });

    return { success: true };
  }

  async verifyOtpBySms({
    phone,
    otp,
    type,
    userId,
    context,
  }: {
    phone?: string;
    otp: string;
    type: OtpTypeEnum;
    userId?: number;
    context: 'http' | 'tcp';
  }): Promise<boolean> {
    const existingOtp = await this.prisma.otpBySms.findFirst({
      where: {
        OR: [{ userId }, { phone }],
        otp,
        type,
        confirmedAt: null,
      },
    });

    if (!existingOtp || isBefore(existingOtp.expiresAt, new Date())) {
      return throwException(context, 'Invalid or expired OTP');
    }

    await this.prisma.otpBySms.update({
      where: { id: existingOtp.id },
      data: { confirmedAt: new Date() },
    });

    return true;
  }

  async verifyOtpByEmail({
    email,
    otp,
    type,
    userId,
    context,
  }: {
    email?: string;
    otp: string;
    type: OtpTypeEnum;
    userId?: number;
    context: 'http' | 'tcp';
  }): Promise<boolean> {
    const existingOtp = await this.prisma.otpByEmail.findFirst({
      where: {
        OR: [{ userId }, { email }],
        otp,
        type,
        confirmedAt: null,
      },
    });

    if (!existingOtp || isBefore(existingOtp.expiresAt, new Date())) {
      return throwException(context, 'Invalid or expired OTP');
    }

    await this.prisma.otpByEmail.update({
      where: { id: existingOtp.id },
      data: { confirmedAt: new Date() },
    });

    return true;
  }
}
