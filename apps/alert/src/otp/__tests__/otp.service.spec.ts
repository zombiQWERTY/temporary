import { Test, TestingModule } from '@nestjs/testing';
import { mockDeep, DeepMockProxy } from 'jest-mock-extended';
import { BadRequestException } from '@nestjs/common';
import { RpcException } from '@nestjs/microservices';
import { subMilliseconds, addMilliseconds } from 'date-fns';
import { PrismaClient } from '@prisma/client';

import { OtpService } from '../otp.service';
import { PrismaService } from '../../services/prisma.service';
import { MailService } from '../../mail/mail.service';
import { SMSService } from '../../services/sms.service';
import { OtpTypeEnum } from '../../../prisma/client';

describe('OtpService', () => {
  let otpService: OtpService;
  let prismaMock: DeepMockProxy<PrismaClient>;
  let mailService: DeepMockProxy<MailService>;
  let smsService: DeepMockProxy<SMSService>;

  beforeEach(async () => {
    prismaMock = mockDeep<PrismaClient>();

    const module: TestingModule = await Test.createTestingModule({
      providers: [
        OtpService,
        {
          provide: PrismaService,
          useValue: prismaMock,
        },
        { provide: MailService, useValue: mockDeep<MailService>() },
        { provide: SMSService, useValue: mockDeep<SMSService>() },
      ],
    }).compile();

    otpService = module.get<OtpService>(OtpService);
    mailService = module.get(MailService);
    smsService = module.get(SMSService);
  });

  afterEach(() => {
    jest.clearAllMocks();
  });

  describe('sendOtpBySms', () => {
    it('should throw an exception if an OTP is already sent within cooldown period', async () => {
      const phone = '1234567890';
      const type = OtpTypeEnum.SIGN_UP;
      const context = 'http';

      const mockCurrentTime = new Date('2024-01-01T00:00:00.000Z');
      jest
        .spyOn(global, 'Date')
        .mockImplementation(() => mockCurrentTime as any);

      const cooldownTime = subMilliseconds(
        mockCurrentTime,
        otpService['otpCooldownTime'],
      );

      prismaMock.otpBySms.findFirst.mockResolvedValue({
        phone,
        otp: '123456',
        sentAt: cooldownTime,
        expiresAt: addMilliseconds(mockCurrentTime, 600000),
      });

      await expect(
        otpService.sendOtpBySms({ phone, type, context }),
      ).rejects.toThrow(BadRequestException);

      expect(prismaMock.otpBySms.findFirst).toHaveBeenCalledWith({
        where: {
          phone,
          type,
          sentAt: {
            gte: cooldownTime,
          },
        },
      });

      jest.restoreAllMocks();
    });

    it('should send a new OTP and save it in the database', async () => {
      const phone = '1234567890';
      const type = OtpTypeEnum.SIGN_UP;
      const context = 'http';
      const otpCode = '654321';

      jest.spyOn(otpService, 'generateOtp').mockReturnValue(otpCode);

      prismaMock.otpBySms.findFirst.mockResolvedValue(null);
      prismaMock.otpBySms.create.mockResolvedValue({ phone, otp: otpCode });

      await otpService.sendOtpBySms({ phone, type, context });

      expect(smsService.sendSms).toHaveBeenCalledWith(phone, otpCode);
      expect(prismaMock.otpBySms.create).toHaveBeenCalledWith({
        data: {
          phone,
          otp: otpCode,
          type,
          expiresAt: expect.any(Date),
          confirmedAt: null,
          userId: undefined,
        },
      });
    });
  });

  describe('sendOtpByEmail', () => {
    it('should throw an exception if an OTP is already sent within cooldown period', async () => {
      const email = 'test@test.com';
      const type = OtpTypeEnum.SIGN_UP;
      const context = 'http';

      const mockCurrentTime = new Date('2024-01-01T00:00:00.000Z');

      jest
        .spyOn(global, 'Date')
        .mockImplementation(() => mockCurrentTime as any);

      const cooldownTime = subMilliseconds(
        mockCurrentTime,
        otpService['otpCooldownTime'],
      );

      prismaMock.otpByEmail.findFirst.mockResolvedValue({
        email,
        otp: '123456',
        sentAt: mockCurrentTime,
        expiresAt: addMilliseconds(mockCurrentTime, 600000),
      });

      await expect(
        otpService.sendOtpByEmail({ email, type, context }),
      ).rejects.toThrow(BadRequestException);

      expect(prismaMock.otpByEmail.findFirst).toHaveBeenCalledWith({
        where: {
          email,
          type,
          sentAt: {
            gte: cooldownTime,
          },
        },
      });
    });

    it('should send a new OTP and save it in the database', async () => {
      const email = 'test@test.com';
      const type = OtpTypeEnum.SIGN_UP;
      const context = 'http';
      const otpCode = '654321';
      const expiryDate = addMilliseconds(
        new Date(),
        otpService['otpExpiryTime'],
      );

      jest.spyOn(otpService, 'generateOtp').mockReturnValue(otpCode);

      prismaMock.otpByEmail.findFirst.mockResolvedValue(null);
      prismaMock.otpByEmail.create.mockResolvedValue({ email, otp: otpCode });

      await otpService.sendOtpByEmail({ email, type, context });

      expect(mailService.sendMail).toHaveBeenCalledWith({
        to: email,
        subject: 'Confirmation Code',
        plainText: otpCode,
        useHtmlTemplate: true,
        templateId: 'confirmationCode',
        data: {
          code: otpCode,
        },
      });
      expect(prismaMock.otpByEmail.create).toHaveBeenCalledWith({
        data: {
          email,
          otp: otpCode,
          type,
          expiresAt: expiryDate,
          confirmedAt: null,
        },
      });
    });
  });

  describe('verifyOtpBySms', () => {
    it('should throw an exception if OTP is invalid or expired', async () => {
      const phone = '1234567890';
      const otp = '123456';
      const type = OtpTypeEnum.SIGN_UP;
      const context = 'tcp';

      prismaMock.otpBySms.findFirst.mockResolvedValue(null);

      await expect(
        otpService.verifyOtpBySms({ phone, otp, type, context }),
      ).rejects.toThrow(RpcException);

      expect(prismaMock.otpBySms.findFirst).toHaveBeenCalledWith({
        where: {
          OR: [{ userId: undefined }, { phone }],
          otp,
          type,
          confirmedAt: null,
        },
      });
    });

    it('should confirm the OTP and update the database', async () => {
      const phone = '1234567890';
      const otp = '123456';
      const type = OtpTypeEnum.SIGN_UP;
      const context = 'tcp';

      const mockCurrentTime = new Date('2024-01-01T00:00:00.000Z');

      jest
        .spyOn(global, 'Date')
        .mockImplementation(() => mockCurrentTime as any);

      const existingOtp = {
        id: 1,
        phone,
        otp,
        expiresAt: addMilliseconds(new Date(), 600000),
        confirmedAt: null,
      };

      prismaMock.otpBySms.findFirst.mockResolvedValue(existingOtp);
      prismaMock.otpBySms.update.mockResolvedValue(existingOtp);

      const result = await otpService.verifyOtpBySms({
        phone,
        otp,
        type,
        context,
      });

      expect(result).toBe(true);

      expect(prismaMock.otpBySms.update).toHaveBeenCalledWith({
        where: { id: existingOtp.id },
        data: { confirmedAt: mockCurrentTime }, // Match the specific mocked Date
      });

      jest.restoreAllMocks();
    });
  });

  describe('verifyOtpByEmail', () => {
    it('should throw an exception if OTP is invalid or expired', async () => {
      const email = 'test@test.com';
      const otp = '123456';
      const type = OtpTypeEnum.SIGN_UP;
      const context = 'http';

      prismaMock.otpByEmail.findFirst.mockResolvedValue(null);

      await expect(
        otpService.verifyOtpByEmail({ email, otp, type, context }),
      ).rejects.toThrow(BadRequestException);

      expect(prismaMock.otpByEmail.findFirst).toHaveBeenCalledWith({
        where: {
          OR: [{ userId: undefined }, { email }],
          otp,
          type,
          confirmedAt: null,
        },
      });
    });

    it('should confirm the OTP and update the database', async () => {
      const email = 'test@test.com';
      const otp = '123456';
      const type = OtpTypeEnum.SIGN_UP;
      const context = 'http';

      const mockCurrentTime = new Date('2024-01-01T00:00:00.000Z');

      jest
        .spyOn(global, 'Date')
        .mockImplementation(() => mockCurrentTime as any);

      const existingOtp = {
        id: 1,
        email,
        otp,
        expiresAt: addMilliseconds(mockCurrentTime, 600000), // 10 minutes later
        confirmedAt: null,
      };

      prismaMock.otpByEmail.findFirst.mockResolvedValue(existingOtp);

      prismaMock.otpByEmail.update.mockResolvedValue(existingOtp);

      const result = await otpService.verifyOtpByEmail({
        email,
        otp,
        type,
        context,
      });

      expect(result).toBe(true);

      expect(prismaMock.otpByEmail.update).toHaveBeenCalledWith({
        where: { id: existingOtp.id },
        data: { confirmedAt: mockCurrentTime },
      });

      jest.restoreAllMocks();
    });
  });
});
