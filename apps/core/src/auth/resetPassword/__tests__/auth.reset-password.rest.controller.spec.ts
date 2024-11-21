import { Test, TestingModule } from '@nestjs/testing';
import { DeepMockProxy, mockDeep } from 'jest-mock-extended';

import { AuthResetPasswordService } from '../auth.reset-password.service';
import { ResetPasswordResponseDto } from '../dto/reset-password.response.dto';
import { UserMetadataParams } from '@erp-modul/shared';
import { ResetPasswordByPhoneRequestDto } from '../dto/reset-password-by-phone.request.dto';
import { ConfirmResetPasswordByPhoneRequestDto } from '../dto/confirm-reset-password-by-phone.request.dto';
import { ResetPasswordByEmailRequestDto } from '../dto/reset-password-by-email.request.dto';
import { ConfirmResetPasswordByEmailRequestDto } from '../dto/confirm-reset-password-by-email.request.dto';
import { ConfirmNewPasswordRequestDto } from '../dto/confirm-new-password.request.dto';
import { AuthResetPasswordRestController } from '../auth.reset-password.rest.controller';

describe('AuthRestController', () => {
  let controller: AuthResetPasswordRestController;
  let authResetPasswordService: DeepMockProxy<AuthResetPasswordService>;

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      controllers: [AuthResetPasswordRestController],
      providers: [
        {
          provide: AuthResetPasswordService,
          useValue: mockDeep<AuthResetPasswordService>(),
        },
      ],
    }).compile();

    controller = module.get<AuthResetPasswordRestController>(
      AuthResetPasswordRestController,
    );
    authResetPasswordService = module.get(AuthResetPasswordService);
  });

  describe('resetPasswordByPhone', () => {
    it('should call authResetPasswordService.resetPassword and return the response', async () => {
      const dto: ResetPasswordByPhoneRequestDto = { phone: '+1234567890' };
      const response: ResetPasswordResponseDto = { code: '111111', ttl: 30000 };

      authResetPasswordService.resetPassword.mockResolvedValue(response);

      const result = await controller.resetPasswordByPhone(dto);

      expect(authResetPasswordService.resetPassword).toHaveBeenCalledWith(
        { phone: dto.phone },
        'sms',
      );
      expect(result).toEqual(response);
    });
  });

  describe('confirmResetPasswordByPhone', () => {
    it('should call authResetPasswordService.confirmResetPassword', async () => {
      const dto: ConfirmResetPasswordByPhoneRequestDto = {
        phone: '+1234567890',
        password: 'newPassword123',
        code: '123456',
      };

      authResetPasswordService.confirmResetPassword.mockResolvedValue({
        ok: true,
      });

      const result = await controller.confirmResetPasswordByPhone(dto);

      expect(
        authResetPasswordService.confirmResetPassword,
      ).toHaveBeenCalledWith(
        { phone: dto.phone },
        dto.password,
        dto.code,
        'sms',
      );
      expect(result).toEqual({ ok: true });
    });
  });

  describe('resetPasswordByEmail', () => {
    it('should call authResetPasswordService.resetPassword and return the response', async () => {
      const dto: ResetPasswordByEmailRequestDto = { email: 'test@example.com' };
      const response: ResetPasswordResponseDto = { code: '111111', ttl: 30000 };

      authResetPasswordService.resetPassword.mockResolvedValue(response);

      const result = await controller.resetPasswordByEmail(dto);

      expect(authResetPasswordService.resetPassword).toHaveBeenCalledWith(
        { email: dto.email },
        'email',
      );
      expect(result).toEqual(response);
    });
  });

  describe('confirmResetPasswordByEmail', () => {
    it('should call authResetPasswordService.confirmResetPassword', async () => {
      const dto: ConfirmResetPasswordByEmailRequestDto = {
        email: 'test@example.com',
        password: 'newPassword123',
        code: '123456',
      };

      authResetPasswordService.confirmResetPassword.mockResolvedValue({
        ok: true,
      });

      const result = await controller.confirmResetPasswordByEmail(dto);

      expect(
        authResetPasswordService.confirmResetPassword,
      ).toHaveBeenCalledWith(
        { email: dto.email },
        dto.password,
        dto.code,
        'email',
      );
      expect(result).toEqual({ ok: true });
    });
  });

  describe('newPasswordByPhone', () => {
    it('should call authResetPasswordService.resetPassword for new password request', async () => {
      const meta = { userId: 1 } as UserMetadataParams;
      const response: ResetPasswordResponseDto = { code: '111111', ttl: 30000 };

      authResetPasswordService.resetPassword.mockResolvedValue(response);

      const result = await controller.newPasswordByPhone(meta);

      expect(authResetPasswordService.resetPassword).toHaveBeenCalledWith(
        { userId: meta.userId },
        'sms',
      );
      expect(result).toEqual(response);
    });
  });

  describe('confirmNewPasswordByPhone', () => {
    it('should call authResetPasswordService.confirmResetPassword for phone confirmation', async () => {
      const dto: ConfirmNewPasswordRequestDto = {
        password: 'newPassword123',
        code: '123456',
      };
      const meta = { userId: 1 } as UserMetadataParams;

      authResetPasswordService.confirmResetPassword.mockResolvedValue({
        ok: true,
      });

      const result = await controller.confirmNewPasswordByPhone(dto, meta);

      expect(
        authResetPasswordService.confirmResetPassword,
      ).toHaveBeenCalledWith(
        { userId: meta.userId },
        dto.password,
        dto.code,
        'sms',
      );
      expect(result).toEqual({ ok: true });
    });
  });

  describe('newPasswordByEmail', () => {
    it('should call authResetPasswordService.resetPassword for new email password request', async () => {
      const meta = { userId: 1 } as UserMetadataParams;
      const response: ResetPasswordResponseDto = { code: '111111', ttl: 30000 };

      authResetPasswordService.resetPassword.mockResolvedValue(response);

      const result = await controller.newPasswordByEmail(meta);

      expect(authResetPasswordService.resetPassword).toHaveBeenCalledWith(
        { userId: meta.userId },
        'email',
      );
      expect(result).toEqual(response);
    });
  });

  describe('confirmNewPasswordByEmail', () => {
    it('should call authResetPasswordService.confirmResetPassword for email confirmation', async () => {
      const dto: ConfirmNewPasswordRequestDto = {
        password: 'newPassword123',
        code: '123456',
      };
      const meta = { userId: 1 } as UserMetadataParams;

      authResetPasswordService.confirmResetPassword.mockResolvedValue({
        ok: true,
      });

      const result = await controller.confirmNewPasswordByEmail(dto, meta);

      expect(
        authResetPasswordService.confirmResetPassword,
      ).toHaveBeenCalledWith(
        { userId: meta.userId },
        dto.password,
        dto.code,
        'email',
      );
      expect(result).toEqual({ ok: true });
    });
  });
});
