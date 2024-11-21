import { Test, TestingModule } from '@nestjs/testing';
import { DeepMockProxy, mockDeep } from 'jest-mock-extended';

import { AuthResetPhoneService } from '../auth.reset-phone.service';
import { AuthResetPhoneRestController } from '../auth.reset-phone.rest.controller';
import { UserMetadataParams } from '@erp-modul/shared';
import { ResetPhoneResponseDto } from '../dto/reset-phone.response.dto';
import { ConfirmNewPhoneRequestDto } from '../dto/confirm-new-phone.request.dto';

describe('AuthResetPhoneRestController', () => {
  let controller: AuthResetPhoneRestController;
  let authResetPhoneService: DeepMockProxy<AuthResetPhoneService>;

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      controllers: [AuthResetPhoneRestController],
      providers: [
        {
          provide: AuthResetPhoneService,
          useValue: mockDeep<AuthResetPhoneService>(),
        },
      ],
    }).compile();

    controller = module.get<AuthResetPhoneRestController>(
      AuthResetPhoneRestController,
    );
    authResetPhoneService = module.get(AuthResetPhoneService);
  });

  describe('newPhone', () => {
    it('should call authResetPhoneService.resetPhone', async () => {
      const meta = { userId: 1 } as UserMetadataParams;
      const response = new ResetPhoneResponseDto({
        code: '111111',
        ttl: 30000,
      });

      authResetPhoneService.resetPhone.mockResolvedValue(response);

      const result = await controller.newPhone(meta);

      expect(authResetPhoneService.resetPhone).toHaveBeenCalledWith({
        userId: meta.userId,
      });
      expect(result).toEqual(response);
    });
  });

  describe('confirmNewPhone', () => {
    it('should call authResetPhoneService.confirmResetPhone', async () => {
      const dto = new ConfirmNewPhoneRequestDto({
        phone: '+79999999999',
        code: '123456',
      });

      const meta = { userId: 1 } as UserMetadataParams;

      authResetPhoneService.confirmResetPhone.mockResolvedValue({ ok: true });

      const result = await controller.confirmNewPhone(dto, meta);

      expect(authResetPhoneService.confirmResetPhone).toHaveBeenCalledWith(
        { userId: meta.userId },
        dto.phone,
        dto.code,
      );
      expect(result).toEqual({ ok: true });
    });
  });
});
