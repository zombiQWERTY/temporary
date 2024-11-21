import { Test, TestingModule } from '@nestjs/testing';
import { RpcException } from '@nestjs/microservices';
import { mock, DeepMockProxy } from 'jest-mock-extended';

import { AlertTcpController } from '../alert.tcp.controller';
import { AlertService } from '../alert.service';
import { SendSmsCodeRequestDto } from '../request-dto/sendSmsCodeRequest.dto';
import { SendCodeResponseDto } from '../response-dto/sendCodeResponse.dto';
import { ConfirmSmsCodeRequestDto } from '../request-dto/confirmSmsCodeRequest.dto';
import { SendEmailCodeRequestDto } from '../request-dto/sendEmailCodeRequest.dto';
import { ConfirmEmailCodeRequestDto } from '../request-dto/confirmEmailCodeRequest.dto';
import { SendRawEmailRequestDto } from '../request-dto/sendRawEmailRequest.dto';
import { $Enums } from '../../../prisma/client';
import OtpTypeEnum = $Enums.OtpTypeEnum;

describe('AlertTcpController', () => {
  let controller: AlertTcpController;
  let alertService: DeepMockProxy<AlertService>;

  beforeEach(async () => {
    alertService = mock<AlertService>();

    const module: TestingModule = await Test.createTestingModule({
      controllers: [AlertTcpController],
      providers: [{ provide: AlertService, useValue: alertService }],
    }).compile();

    controller = module.get<AlertTcpController>(AlertTcpController);
  });

  describe('sendSmsCode', () => {
    it('should successfully send an SMS code', async () => {
      const dto: SendSmsCodeRequestDto = {
        phone: '1234567890',
        userId: 1,
        type: OtpTypeEnum.SIGN_UP,
      };
      const expectedResponse: SendCodeResponseDto = {
        code: '123456',
        message: 'message',
        ttl: 600,
      };

      alertService.sendOtpBySms.mockResolvedValue(expectedResponse);

      const result = await controller.sendSmsCode(dto);
      expect(result).toEqual(expectedResponse);
      expect(alertService.sendOtpBySms).toHaveBeenCalledWith({
        phone: dto.phone,
        type: dto.type,
        userId: dto.userId,
        context: 'tcp',
      });
    });

    it('should throw RpcException when there is an error sending SMS code', async () => {
      const dto: SendSmsCodeRequestDto = {
        phone: '1234567890',
        type: 'SIGN_UP',
        userId: 1,
      };
      const error = new RpcException('Unable to send SMS');

      alertService.sendOtpBySms.mockRejectedValue(error);

      await expect(controller.sendSmsCode(dto)).rejects.toThrow(RpcException);
    });
  });

  describe('confirmSmsCode', () => {
    it('should confirm SMS code successfully', async () => {
      const dto: ConfirmSmsCodeRequestDto = {
        phone: '1234567890',
        code: '123456',
        type: 'SIGN_UP',
        userId: 1,
      };

      alertService.verifyOtpBySms.mockResolvedValue(true);

      const result = await controller.confirmSmsCode(dto);
      expect(result).toBe(true);
      expect(alertService.verifyOtpBySms).toHaveBeenCalledWith({
        phone: dto.phone,
        otp: dto.code,
        type: dto.type,
        userId: dto.userId,
        context: 'tcp',
      });
    });

    it('should throw RpcException when there is an error confirming SMS code', async () => {
      const dto: ConfirmSmsCodeRequestDto = {
        phone: '1234567890',
        code: '123456',
        type: 'SIGN_UP',
        userId: 1,
      };
      const error = new RpcException('Invalid code');

      alertService.verifyOtpBySms.mockRejectedValue(error);

      await expect(controller.confirmSmsCode(dto)).rejects.toThrow(
        RpcException,
      );
    });
  });

  describe('sendEmailCode', () => {
    it('should successfully send an Email code', async () => {
      const dto: SendEmailCodeRequestDto = {
        email: 'test@test.com',
        type: 'SIGN_UP',
        userId: 1,
      };
      const expectedResponse: SendCodeResponseDto = {
        code: '123456',
        message: 'message',
        ttl: 600,
      };

      alertService.sendOtpByEmail.mockResolvedValue(expectedResponse);

      const result = await controller.sendEmailCode(dto);
      expect(result).toEqual(expectedResponse);
      expect(alertService.sendOtpByEmail).toHaveBeenCalledWith({
        email: dto.email,
        type: dto.type,
        userId: dto.userId,
        context: 'tcp',
      });
    });

    it('should throw RpcException when there is an error sending Email code', async () => {
      const dto: SendEmailCodeRequestDto = {
        email: 'test@test.com',
        type: 'SIGN_UP',
        userId: 1,
      };
      const error = new RpcException('Unable to send Email');

      alertService.sendOtpByEmail.mockRejectedValue(error);

      await expect(controller.sendEmailCode(dto)).rejects.toThrow(RpcException);
    });
  });

  describe('confirmEmailCode', () => {
    it('should confirm Email code successfully', async () => {
      const dto: ConfirmEmailCodeRequestDto = {
        email: 'test@test.com',
        code: '123456',
        type: 'SIGN_UP',
        userId: 1,
      };

      alertService.verifyOtpByEmail.mockResolvedValue(true);

      const result = await controller.confirmEmailCode(dto);
      expect(result).toBe(true);
      expect(alertService.verifyOtpByEmail).toHaveBeenCalledWith({
        email: dto.email,
        otp: dto.code,
        type: dto.type,
        userId: dto.userId,
        context: 'tcp',
      });
    });

    it('should throw RpcException when there is an error confirming Email code', async () => {
      const dto: ConfirmEmailCodeRequestDto = {
        email: 'test@test.com',
        code: '123456',
        type: 'SIGN_UP',
        userId: 1,
      };
      const error = new RpcException('Invalid code');

      alertService.verifyOtpByEmail.mockRejectedValue(error);

      await expect(controller.confirmEmailCode(dto)).rejects.toThrow(
        RpcException,
      );
    });
  });

  describe('sendRawEmail', () => {
    it('should successfully send an Email', async () => {
      const dto: SendRawEmailRequestDto = {
        email: 'test@test.com',
        subject: 'test',
        text: 'hi',
      };
      const expectedResponse = { success: true };

      alertService.sendEmail.mockResolvedValue(expectedResponse);

      const result = await controller.sendRawEmail(dto);
      expect(result).toEqual(expectedResponse);
      expect(alertService.sendEmail).toHaveBeenCalledWith(
        dto.email,
        dto.subject,
        dto.text,
        undefined,
      );
    });

    it('should throw RpcException when there is an error sending Email', async () => {
      const dto: SendRawEmailRequestDto = {
        email: 'test@test.com',
        subject: 'test',
        text: 'hi',
      };
      const error = new RpcException('Unable to send Email');

      alertService.sendEmail.mockRejectedValue(error);

      await expect(controller.sendRawEmail(dto)).rejects.toThrow(RpcException);
    });
  });
});
