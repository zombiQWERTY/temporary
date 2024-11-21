import { Test, TestingModule } from '@nestjs/testing';
import { DeepMockProxy, mockDeep } from 'jest-mock-extended';
import { Request } from 'express';

import { AuthSignUpRestController } from '../auth.signup.rest.controller';
import { AuthSignUpService } from '../auth.signup.service';
import { RegisterRequestDto } from '../dto/register.request.dto';
import { RegisterResponseDto } from '../dto/register.response.dto';
import { ConfirmPhoneRequestDto } from '../dto/confirm-phone.request.dto';
import { ConfirmEmailRequestDto } from '../dto/confirm-email.request.dto';

describe('AuthSignupRestController', () => {
  let controller: AuthSignUpRestController;
  let authSignUpService: DeepMockProxy<AuthSignUpService>;
  let req: Request;
  let countryCode: string;
  let lang: string;
  let branchId: number;
  let managerId: number;
  let utmSource: string;
  let utmMedium: string;
  let utmCampaign: string;
  let utmContent: string;
  let utmTerm: string;

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      controllers: [AuthSignUpRestController],
      providers: [
        {
          provide: AuthSignUpService,
          useValue: mockDeep<AuthSignUpService>(),
        },
      ],
    }).compile();

    controller = module.get<AuthSignUpRestController>(AuthSignUpRestController);
    authSignUpService = module.get(AuthSignUpService);

    req = {
      headers: { 'user-agent': 'test-agent' },
      ip: '127.0.0.1',
    } as Request;

    countryCode = 'US';
    lang = 'en';
    branchId = 1;
    managerId = 2;
    utmSource = 'source';
    utmMedium = 'medium';
    utmCampaign = 'campaign';
    utmContent = 'content';
    utmTerm = 'term';
  });

  const createRegisterRequestDto = (): RegisterRequestDto =>
    new RegisterRequestDto({
      email: 'test@example.com',
      phone: '+79209999999',
    });

  const createRegisterResponseDto = (): RegisterResponseDto =>
    new RegisterResponseDto({ code: '111111', ttl: 30000 });

  const createConfirmPhoneRequestDto = (): ConfirmPhoneRequestDto =>
    new ConfirmPhoneRequestDto({
      code: '123456',
      phone: '+1234567890',
      email: 'test@test.com',
      password: '123123123',
    });

  const createConfirmEmailRequestDto = (): ConfirmEmailRequestDto =>
    new ConfirmEmailRequestDto({
      code: '123456',
      phone: '+1234567890',
      email: 'test@test.com',
      password: '123123123',
    });

  describe('SignUp', () => {
    it('should call authSignUpService.register and return the result', async () => {
      const dto = createRegisterRequestDto();
      const response = createRegisterResponseDto();

      authSignUpService.register.mockResolvedValue(response);

      const result = await controller.register(dto);

      expect(authSignUpService.register).toHaveBeenCalledWith(dto);
      expect(result).toEqual(response);
    });
  });

  describe('confirmRegisteredPhone', () => {
    it('should call authSignUpService.confirmRegistered with correct arguments', async () => {
      const dto = createConfirmPhoneRequestDto();

      authSignUpService.confirmRegistered.mockResolvedValue({ ok: true });

      const result = await controller.confirmRegisteredPhone(
        dto,
        req,
        countryCode,
        lang,
        branchId,
        managerId,
        utmSource,
        utmMedium,
        utmCampaign,
        utmContent,
        utmTerm,
      );

      expect(authSignUpService.confirmRegistered).toHaveBeenCalledWith({
        dto: { phone: dto.phone, email: dto.email, password: dto.password },
        inviteTags: { branchId, countryCode, lang, managerId },
        utmTags: {
          utmSource,
          utmMedium,
          utmCampaign,
          utmContent,
          utmTerm,
          userAgent: 'test-agent',
          ipAddress: '127.0.0.1',
        },
        code: dto.code,
        method: 'sms',
      });
      expect(result).toEqual({ ok: true });
    });
  });

  describe('confirmRegisteredEmail', () => {
    it('should call authSignUpService.confirmRegistered with correct arguments', async () => {
      const dto = createConfirmEmailRequestDto();

      authSignUpService.confirmRegistered.mockResolvedValue({ ok: true });

      const result = await controller.confirmRegisteredEmail(
        dto,
        req,
        countryCode,
        lang,
        branchId,
        managerId,
        utmSource,
        utmMedium,
        utmCampaign,
        utmContent,
        utmTerm,
      );

      expect(authSignUpService.confirmRegistered).toHaveBeenCalledWith({
        dto: { email: dto.email, phone: dto.phone, password: dto.password },
        inviteTags: { branchId, countryCode, lang, managerId },
        utmTags: {
          utmSource,
          utmMedium,
          utmCampaign,
          utmContent,
          utmTerm,
          userAgent: 'test-agent',
          ipAddress: '127.0.0.1',
        },
        code: dto.code,
        method: 'email',
      });
      expect(result).toEqual({ ok: true });
    });
  });
});
