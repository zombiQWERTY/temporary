import { Test, TestingModule } from '@nestjs/testing';
import { DeepMockProxy, mockDeep } from 'jest-mock-extended';

import { AuthResetEmailService } from '../auth.reset-email.service';
import { AuthResetEmailRestController } from '../auth.reset-email.rest.controller';
import { UserMetadataParams } from '@erp-modul/shared';
import { ResetEmailResponseDto } from '../dto/reset-email.response.dto';
import { ConfirmNewEmailRequestDto } from '../dto/confirm-new-email.request.dto';

describe('AuthResetEmailRestController', () => {
  let controller: AuthResetEmailRestController;
  let authResetEmailService: DeepMockProxy<AuthResetEmailService>;

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      controllers: [AuthResetEmailRestController],
      providers: [
        {
          provide: AuthResetEmailService,
          useValue: mockDeep<AuthResetEmailService>(),
        },
      ],
    }).compile();

    controller = module.get<AuthResetEmailRestController>(
      AuthResetEmailRestController,
    );
    authResetEmailService = module.get(AuthResetEmailService);
  });

  describe('newEmail', () => {
    it('should call authResetEmailService.resetEmail', async () => {
      const meta = { userId: 1 } as UserMetadataParams;
      const response = new ResetEmailResponseDto({
        code: '111111',
        ttl: 30000,
      });

      authResetEmailService.resetEmail.mockResolvedValue(response);

      const result = await controller.newEmail(meta);

      expect(authResetEmailService.resetEmail).toHaveBeenCalledWith({
        userId: meta.userId,
      });
      expect(result).toEqual(response);
    });
  });

  describe('confirmNewEmail', () => {
    it('should call authResetEmailService.confirmResetEmail', async () => {
      const dto = new ConfirmNewEmailRequestDto({
        email: 'new@example.com',
        code: '123456',
      });

      const meta = { userId: 1 } as UserMetadataParams;

      authResetEmailService.confirmResetEmail.mockResolvedValue({ ok: true });

      const result = await controller.confirmNewEmail(dto, meta);

      expect(authResetEmailService.confirmResetEmail).toHaveBeenCalledWith(
        { userId: meta.userId },
        dto.email,
        dto.code,
      );
      expect(result).toEqual({ ok: true });
    });
  });
});
