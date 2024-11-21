import { Test, TestingModule } from '@nestjs/testing';
import { DeepMockProxy, mockDeep } from 'jest-mock-extended';
import { ForbiddenException } from '@nestjs/common';

import { RoleEnum, UserMetadataParams } from '@erp-modul/shared';
import { AuthSignInRestController } from '../auth.signin.rest.controller';
import { AuthSignInService } from '../auth.signin.service';
import { BranchesService } from '../../../branches/branches.service';
import { LoginPhoneRequestDto } from '../dto/login-phone.request.dto';
import { TokensResponseDto } from '../dto/tokens.response.dto';
import { LoginEmailRequestDto } from '../dto/login-email.request.dto';
import { SelectMetaRequestDto } from '../dto/select-meta.request.dto';
import { ProxyLoginRequestDto } from '../dto/proxy-login.request.dto';

describe('AuthSignInRestController', () => {
  let controller: AuthSignInRestController;
  let authSignInService: DeepMockProxy<AuthSignInService>;
  let branchesService: DeepMockProxy<BranchesService>;

  const userId = 1;
  const loginResult = {
    id: 1,
    mainRole: RoleEnum.Client,
    roles: [{ slug: RoleEnum.Client, id: 1, weight: 100 }],
    userId,
    phone: '',
    email: '',
    phoneConfirmed: true,
    emailConfirmed: true,
    phoneConfirmedAt: null,
    emailConfirmedAt: null,
    createdAt: new Date(),
    updatedAt: new Date(),
  };
  const branchesMeta = {
    branches: [
      {
        branchId: 1,
        isHeadOfBranch: false,
        userId,
        userRole: RoleEnum.Client,
      },
    ],
    mainBranchId: 1,
  };
  const tokensResponse = new TokensResponseDto({
    accessToken: {
      aud: 'aud',
      roles: [RoleEnum.Client],
      sub: 'sub',
      exp: 1111,
      jti: 'jti',
    },
    refreshToken: {
      aud: 'aud',
      roles: [RoleEnum.Client],
      sub: 'sub',
      exp: 1111,
      jti: 'jti',
    },
    mainRole: RoleEnum.Client,
    roles: [{ id: 1, slug: RoleEnum.Client, weight: 100 }],
    branches: branchesMeta.branches,
    mainBranchId: branchesMeta.mainBranchId,
    userId,
  });

  const createLoginPhoneRequestDto = () =>
    new LoginPhoneRequestDto({
      phone: '+1234567890',
      password: 'password123',
    });

  const createLoginEmailRequestDto = () =>
    new LoginEmailRequestDto({
      email: 'test@example.com',
      password: 'password123',
    });

  const createSelectMetaRequestDto = () =>
    new SelectMetaRequestDto({
      role: RoleEnum.Client,
      branchId: 1,
    });

  beforeEach(async () => {
    authSignInService = mockDeep<AuthSignInService>();
    branchesService = mockDeep<BranchesService>();

    const module: TestingModule = await Test.createTestingModule({
      controllers: [AuthSignInRestController],
      providers: [
        { provide: AuthSignInService, useValue: authSignInService },
        { provide: BranchesService, useValue: branchesService },
      ],
    }).compile();

    controller = module.get<AuthSignInRestController>(AuthSignInRestController);
  });

  describe('loginPhone', () => {
    it('should call authSignInService.login and authSignInService.makeTokens', async () => {
      const dto = createLoginPhoneRequestDto();
      const target = 'client';

      authSignInService.login.mockResolvedValue(loginResult);
      branchesService.getRelatedBranches.mockResolvedValue(branchesMeta);
      authSignInService.makeTokens.mockReturnValue(tokensResponse);

      const result = await controller.loginPhone(dto, target);

      expect(authSignInService.login).toHaveBeenCalledWith({
        target,
        identifier: dto,
        loginMethod: 'phone',
      });
      expect(branchesService.getRelatedBranches).toHaveBeenCalledWith(
        userId,
        loginResult.mainRole,
      );
      expect(authSignInService.makeTokens).toHaveBeenCalledWith({
        branches: branchesMeta.branches,
        mainBranchId: branchesMeta.mainBranchId,
        sub: loginResult.id,
        mainRole: loginResult.mainRole,
        roles: loginResult.roles,
        userId: loginResult.userId,
      });
      expect(result).toEqual(tokensResponse);
    });
  });

  describe('loginEmail', () => {
    it('should call authSignInService.login and authSignInService.makeTokens', async () => {
      const dto = createLoginEmailRequestDto();
      const target = 'client';

      authSignInService.login.mockResolvedValue(loginResult);
      branchesService.getRelatedBranches.mockResolvedValue(branchesMeta);
      authSignInService.makeTokens.mockReturnValue(tokensResponse);

      const result = await controller.loginEmail(dto, target);

      expect(authSignInService.login).toHaveBeenCalledWith({
        target,
        identifier: dto,
        loginMethod: 'email',
      });
      expect(branchesService.getRelatedBranches).toHaveBeenCalledWith(
        userId,
        loginResult.mainRole,
      );
      expect(authSignInService.makeTokens).toHaveBeenCalledWith({
        branches: branchesMeta.branches,
        mainBranchId: branchesMeta.mainBranchId,
        sub: loginResult.id,
        mainRole: loginResult.mainRole,
        roles: loginResult.roles,
        userId: loginResult.userId,
      });
      expect(result).toEqual(tokensResponse);
    });
  });

  describe('selectMeta', () => {
    it('should throw ForbiddenException if role is not admin and branchId is missing', async () => {
      const dto = new SelectMetaRequestDto({
        role: RoleEnum.Client,
        branchId: null,
      });
      const meta = {
        userId: 1,
        role: RoleEnum.Client,
        branchId: null,
      } as UserMetadataParams;

      authSignInService.selectRole.mockResolvedValue(loginResult);

      await expect(controller.selectMeta(dto, meta)).rejects.toThrow(
        new ForbiddenException('branchId is not provided'),
      );
    });

    it('should call authSignInService.makeTokens and return the result', async () => {
      const dto = createSelectMetaRequestDto();
      const meta = {
        userId: 1,
        role: RoleEnum.Client,
        branchId: 1,
      } as UserMetadataParams;

      authSignInService.selectRole.mockResolvedValue(loginResult);
      branchesService.getRelatedBranches.mockResolvedValue(branchesMeta);
      authSignInService.makeTokens.mockReturnValue(tokensResponse);

      const result = await controller.selectMeta(dto, meta);

      expect(authSignInService.selectRole).toHaveBeenCalledWith(
        meta.userId,
        dto.role,
      );
      expect(branchesService.getRelatedBranches).toHaveBeenCalledWith(
        meta.userId,
        loginResult.mainRole,
      );
      expect(authSignInService.makeTokens).toHaveBeenCalledWith({
        branches: branchesMeta.branches,
        mainBranchId: dto.role === RoleEnum.Admin ? 'ALL' : dto.branchId,
        sub: loginResult.id,
        mainRole: loginResult.mainRole,
        roles: loginResult.roles,
        userId: loginResult.userId,
      });
      expect(result).toEqual(tokensResponse);
    });
  });

  describe('defaultMeta', () => {
    it('should return user metadata', async () => {
      const meta = { branchId: 1, role: RoleEnum.Client } as UserMetadataParams;

      const result = await controller.defaultMeta(meta);

      expect(result).toEqual({
        mainBranchId: meta.branchId,
        mainRole: meta.role,
      });
    });
  });

  describe('proxyLogin', () => {
    it('should call authSignInService.proxyLogin and return tokens', async () => {
      const dto = new ProxyLoginRequestDto({ proxyId: 1 });
      const meta = {
        userId: 2,
        role: RoleEnum.Admin,
        branchId: 1,
        authId: 1,
      } as UserMetadataParams;

      authSignInService.proxyLogin.mockResolvedValue(loginResult);
      branchesService.getRelatedBranches.mockResolvedValue(branchesMeta);
      authSignInService.makeTokens.mockReturnValue(tokensResponse);

      const result = await controller.proxyLogin(meta, dto);

      expect(authSignInService.proxyLogin).toHaveBeenCalledWith(
        meta.userId,
        meta.role,
        dto.proxyId,
      );
      expect(branchesService.getRelatedBranches).toHaveBeenCalledWith(
        loginResult.userId,
        loginResult.mainRole,
      );
      expect(authSignInService.makeTokens).toHaveBeenCalledWith({
        ...branchesMeta,
        sub: loginResult.id,
        mainRole: loginResult.mainRole,
        roles: loginResult.roles,
        hostBranchId: meta.branchId,
        hostAuthId: meta.authId,
        hostRole: meta.role,
        hostUserId: meta.userId,
        userId: loginResult.userId,
      });
      expect(result).toEqual(tokensResponse);
    });
  });

  describe('renewAuth', () => {
    it('should call authSignInService.checkAuth and return tokens', async () => {
      const meta = {
        userId: 1,
        role: RoleEnum.Client,
        branchId: 1,
        authId: 1,
      } as UserMetadataParams;

      authSignInService.checkAuth.mockResolvedValue(loginResult);
      branchesService.getRelatedBranches.mockResolvedValue(branchesMeta);
      authSignInService.makeTokens.mockReturnValue(tokensResponse);

      const result = await controller.renewAuth(meta);

      expect(authSignInService.checkAuth).toHaveBeenCalledWith(meta.authId);
      expect(branchesService.getRelatedBranches).toHaveBeenCalledWith(
        loginResult.userId,
        meta.role,
      );
      expect(authSignInService.makeTokens).toHaveBeenCalledWith({
        ...branchesMeta,
        sub: loginResult.id,
        mainRole: loginResult.mainRole,
        roles: loginResult.roles,
        userId: meta.userId,
      });
      expect(result).toEqual(tokensResponse);
    });
  });
});
