import { Test, TestingModule } from '@nestjs/testing';
import { RpcException } from '@nestjs/microservices';
import { mock, DeepMockProxy } from 'jest-mock-extended';

import { AlertRestController } from '../alert.rest.controller';
import { AlertService } from '../alert.service';
import { SendSmsCodeRequestDto } from '../request-dto/sendSmsCodeRequest.dto';
import { SendCodeResponseDto } from '../response-dto/sendCodeResponse.dto';
import { SendEmailCodeRequestDto } from '../request-dto/sendEmailCodeRequest.dto';
import { UserMetadataParams } from '@erp-modul/shared';

describe('AlertRestController', () => {
  let controller: AlertRestController;
  let alertService: DeepMockProxy<AlertService>;

  beforeEach(async () => {
    alertService = mock<AlertService>();

    const module: TestingModule = await Test.createTestingModule({
      controllers: [AlertRestController],
      providers: [{ provide: AlertService, useValue: alertService }],
    }).compile();

    controller = module.get<AlertRestController>(AlertRestController);
  });

  describe('sendSmsCode', () => {
    it('should successfully send an SMS code and return the result', async () => {
      const dto: SendSmsCodeRequestDto = {
        phone: '1234567890',
        type: 'SIGN_UP',
        userId: undefined,
      };
      const expectedResponse: SendCodeResponseDto = {
        code: '123456',
        message: 'message',
        ttl: 600,
      };
      const meta: UserMetadataParams = {
        userId: 1,
        role: null,
        branchId: null,
        authId: null,
      };

      alertService.sendOtpBySms.mockResolvedValue(expectedResponse);

      const result = await controller.sendSmsCode(dto, meta);

      expect(result).toEqual(expectedResponse);
      expect(alertService.sendOtpBySms).toHaveBeenCalledWith({
        phone: dto.phone,
        type: dto.type,
        userId: meta.userId,
        context: 'http',
      });
    });

    it('should throw RpcException when sending SMS code fails', async () => {
      const dto: SendSmsCodeRequestDto = {
        phone: '1234567890',
        userId: undefined,
        type: 'SIGN_UP',
      };
      const error = new RpcException('Service unavailable');
      const meta: UserMetadataParams = {
        userId: 1,
        role: null,
        branchId: null,
        authId: null,
      };

      alertService.sendOtpBySms.mockRejectedValue(error);

      await expect(controller.sendSmsCode(dto, meta)).rejects.toThrow(
        RpcException,
      );

      expect(alertService.sendOtpBySms).toHaveBeenCalledWith({
        phone: dto.phone,
        type: dto.type,
        userId: meta.userId,
        context: 'http',
      });
    });
  });

  describe('sendEmailCode', () => {
    it('should successfully send an Email code and return the result', async () => {
      const dto: SendEmailCodeRequestDto = {
        email: 'test@test.com',
        userId: undefined,
        type: 'SIGN_UP',
      };
      const expectedResponse: SendCodeResponseDto = {
        code: '123456',
        message: 'message',
        ttl: 600,
      };
      const meta: UserMetadataParams = {
        userId: 1,
        role: null,
        branchId: null,
        authId: null,
      };

      alertService.sendOtpByEmail.mockResolvedValue(expectedResponse);

      const result = await controller.sendEmailCode(dto, meta);

      expect(result).toEqual(expectedResponse);
      expect(alertService.sendOtpByEmail).toHaveBeenCalledWith({
        email: dto.email,
        type: dto.type,
        userId: meta.userId,
        context: 'http',
      });
    });

    it('should throw RpcException when sending Email code fails', async () => {
      const dto: SendEmailCodeRequestDto = {
        email: 'test@test.com',
        userId: undefined,
        type: 'SIGN_UP',
      };
      const error = new RpcException('Service unavailable');
      const meta: UserMetadataParams = {
        userId: 1,
        role: null,
        branchId: null,
        authId: null,
      };

      alertService.sendOtpByEmail.mockRejectedValue(error);

      await expect(controller.sendEmailCode(dto, meta)).rejects.toThrow(
        RpcException,
      );

      expect(alertService.sendOtpByEmail).toHaveBeenCalledWith({
        email: dto.email,
        type: dto.type,
        userId: meta.userId,
        context: 'http',
      });
    });
  });
});
