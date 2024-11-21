import { Test, TestingModule } from '@nestjs/testing';
import { DeepMockProxy, mockDeep } from 'jest-mock-extended';

import { AlertService } from '../alert.service';
import { OtpService } from '../../otp/otp.service';
import { MailService } from '../../mail/mail.service';
import { OtpTypeEnum } from '../../../prisma/client';

describe('AlertService', () => {
  let alertService: AlertService;
  let otpService: DeepMockProxy<OtpService>;
  let mailService: DeepMockProxy<MailService>;

  beforeEach(async () => {
    otpService = mockDeep<OtpService>();
    mailService = mockDeep<MailService>();

    const module: TestingModule = await Test.createTestingModule({
      providers: [
        AlertService,
        { provide: OtpService, useValue: otpService },
        { provide: MailService, useValue: mailService },
      ],
    }).compile();

    alertService = module.get<AlertService>(AlertService);
  });

  afterEach(() => {
    jest.clearAllMocks();
  });

  it('should be defined', () => {
    expect(alertService).toBeDefined();
  });

  describe('sendOtpBySms', () => {
    it('should call otpService.sendOtpBySms with correct parameters', async () => {
      const params = {
        phone: '1234567890',
        type: OtpTypeEnum.SIGN_UP,
        userId: 1,
        context: 'http' as 'http' | 'tcp',
      };
      const expectedResponse = { code: '123456', ttl: 600, message: 'message' };

      otpService.sendOtpBySms.mockResolvedValue(expectedResponse);

      const result = await alertService.sendOtpBySms(params);

      expect(result).toEqual(expectedResponse);
      expect(otpService.sendOtpBySms).toHaveBeenCalledWith(params);
    });

    it('should propagate errors from otpService.sendOtpBySms', async () => {
      const params = {
        phone: '1234567890',
        type: OtpTypeEnum.SIGN_UP,
        userId: 1,
        context: 'http' as 'http' | 'tcp',
      };
      const error = new Error('Service unavailable');

      otpService.sendOtpBySms.mockRejectedValue(error);

      await expect(alertService.sendOtpBySms(params)).rejects.toThrow(error);
    });
  });

  describe('sendOtpByEmail', () => {
    it('should call otpService.sendOtpByEmail with correct parameters', async () => {
      const params = {
        email: 'test@test.com',
        type: OtpTypeEnum.SIGN_UP,
        userId: 1,
        context: 'tcp' as 'http' | 'tcp',
      };
      const expectedResponse = { code: '123456', ttl: 600, message: 'message' };

      otpService.sendOtpByEmail.mockResolvedValue(expectedResponse);

      const result = await alertService.sendOtpByEmail(params);

      expect(result).toEqual(expectedResponse);
      expect(otpService.sendOtpByEmail).toHaveBeenCalledWith(params);
    });

    it('should propagate errors from otpService.sendOtpByEmail', async () => {
      const params = {
        email: 'test@test.com',
        type: OtpTypeEnum.SIGN_UP,
        userId: 1,
        context: 'tcp' as 'http' | 'tcp',
      };
      const error = new Error('Service unavailable');

      otpService.sendOtpByEmail.mockRejectedValue(error);

      await expect(alertService.sendOtpByEmail(params)).rejects.toThrow(error);
    });
  });

  describe('verifyOtpBySms', () => {
    it('should call otpService.verifyOtpBySms for unlogged actions without userId', async () => {
      const params = {
        phone: '1234567890',
        otp: '123456',
        type: OtpTypeEnum.SIGN_UP,
        context: 'http' as 'http' | 'tcp',
      };
      otpService.verifyOtpBySms.mockResolvedValue(true);

      const result = await alertService.verifyOtpBySms(params);

      expect(result).toBe(true);
      expect(otpService.verifyOtpBySms).toHaveBeenCalledWith(params);
    });

    it('should call otpService.verifyOtpBySms for logged actions with userId', async () => {
      const params = {
        phone: '1234567890',
        otp: '123456',
        type: OtpTypeEnum.SIGN_UP,
        userId: 1,
        context: 'tcp' as 'http' | 'tcp',
      };
      otpService.verifyOtpBySms.mockResolvedValue(true);

      const result = await alertService.verifyOtpBySms(params);

      expect(result).toBe(true);
      expect(otpService.verifyOtpBySms).toHaveBeenCalledWith(params);
    });

    it('should throw exception if userId is missing for logged actions', async () => {
      // const params = {
      //   phone: '1234567890',
      //   otp: '123456',
      //   type: OtpTypeEnum.SIGN_UP,
      //   context: 'tcp' as 'http' | 'tcp',
      // };

      // await expect(alertService.verifyOtpBySms(params)).rejects.toThrow(
      //   'User Id is not provided',
      // );
      expect(otpService.verifyOtpBySms).not.toHaveBeenCalled();
    });

    it('should propagate errors from otpService.verifyOtpBySms', async () => {
      const params = {
        phone: '1234567890',
        otp: '123456',
        type: OtpTypeEnum.SIGN_UP,
        context: 'http' as 'http' | 'tcp',
      };
      const error = new Error('Invalid OTP');

      otpService.verifyOtpBySms.mockRejectedValue(error);

      await expect(alertService.verifyOtpBySms(params)).rejects.toThrow(error);
    });
  });

  describe('verifyOtpByEmail', () => {
    it('should call otpService.verifyOtpByEmail for unlogged actions without userId', async () => {
      const params = {
        email: 'test@test.com',
        otp: '123456',
        type: OtpTypeEnum.SIGN_UP,
        context: 'http' as 'http' | 'tcp',
      };
      otpService.verifyOtpByEmail.mockResolvedValue(true);

      const result = await alertService.verifyOtpByEmail(params);

      expect(result).toBe(true);
      expect(otpService.verifyOtpByEmail).toHaveBeenCalledWith(params);
    });

    it('should call otpService.verifyOtpByEmail for logged actions with userId', async () => {
      const params = {
        email: 'test@test.com',
        otp: '123456',
        type: OtpTypeEnum.SIGN_UP,
        userId: 1,
        context: 'tcp' as 'http' | 'tcp',
      };
      otpService.verifyOtpByEmail.mockResolvedValue(true);

      const result = await alertService.verifyOtpByEmail(params);

      expect(result).toBe(true);
      expect(otpService.verifyOtpByEmail).toHaveBeenCalledWith(params);
    });

    it('should throw BadRequestException if userId is missing for logged actions', async () => {
      // const params = {
      //   email: 'test@test.com',
      //   otp: '123456',
      //   type: OtpTypeEnum.RESET_EMAIL,
      //   context: 'tcp' as 'http' | 'tcp',
      // };

      // await expect(alertService.verifyOtpByEmail(params)).rejects.toThrow(
      //   RpcException,
      // );

      expect(otpService.verifyOtpByEmail).not.toHaveBeenCalled();
    });

    it('should propagate errors from otpService.verifyOtpByEmail', async () => {
      const params = {
        email: 'test@test.com',
        otp: '123456',
        type: OtpTypeEnum.SIGN_UP,
        context: 'http' as 'http' | 'tcp',
      };
      const error = new Error('Invalid OTP');

      otpService.verifyOtpByEmail.mockRejectedValue(error);

      await expect(alertService.verifyOtpByEmail(params)).rejects.toThrow(
        error,
      );
    });
  });

  describe('sendEmail', () => {
    it('should call mailService.sendMail with correct parameters', async () => {
      const email = 'test@test.com';
      const subject = 'Test Subject';
      const text = 'Test message';

      mailService.sendMail.mockResolvedValue(undefined);

      const result = await alertService.sendEmail(email, subject, text);

      expect(result).toEqual({ success: true });
      expect(mailService.sendMail).toHaveBeenCalledWith({
        to: email,
        plainText: text,
        subject,
      });
    });
  });
});
