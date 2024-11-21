import {
  Body,
  Controller,
  DefaultValuePipe,
  ForbiddenException,
  Get,
  Post,
  Query,
} from '@nestjs/common';

import { BranchesService } from '../../branches/branches.service';
import { GetMetaParams, RoleEnum, UserMetadataParams } from '@erp-modul/shared';
import { AuthSignInService } from './auth.signin.service';
import { LoginPhoneRequestDto } from './dto/login-phone.request.dto';
import { TokensResponseDto } from './dto/tokens.response.dto';
import { LoginEmailRequestDto } from './dto/login-email.request.dto';
import { SelectMetaRequestDto } from './dto/select-meta.request.dto';
import { ProxyLoginRequestDto } from './dto/proxy-login.request.dto';

@Controller('auth/signin')
export class AuthSignInRestController {
  constructor(
    private readonly authSignInService: AuthSignInService,
    private readonly branchesService: BranchesService,
  ) {}

  @Post('phone')
  async loginPhone(
    @Body() dto: LoginPhoneRequestDto,
    @Query('target', new DefaultValuePipe(null))
    target: 'client' | 'admin' | null,
  ): Promise<TokensResponseDto> {
    const {
      id: sub,
      mainRole,
      roles,
      userId,
    } = await this.authSignInService.login({
      target,
      identifier: dto,
      loginMethod: 'phone',
    });

    const branchesMeta = await this.branchesService.getRelatedBranches(
      userId,
      mainRole,
    );

    return this.authSignInService.makeTokens({
      branches: branchesMeta.branches,
      mainBranchId: branchesMeta.mainBranchId,
      sub,
      mainRole,
      roles,
      userId,
    });
  }

  @Post('email')
  async loginEmail(
    @Body() dto: LoginEmailRequestDto,
    @Query('target', new DefaultValuePipe(null))
    target: 'client' | 'admin' | null,
  ): Promise<TokensResponseDto> {
    const {
      id: sub,
      mainRole,
      roles,
      userId,
    } = await this.authSignInService.login({
      target,
      identifier: dto,
      loginMethod: 'email',
    });

    const branchesMeta = await this.branchesService.getRelatedBranches(
      userId,
      mainRole,
    );

    return this.authSignInService.makeTokens({
      branches: branchesMeta.branches,
      mainBranchId: branchesMeta.mainBranchId,
      sub,
      mainRole,
      roles,
      userId,
    });
  }

  @Post('select-meta')
  async selectMeta(
    @Body() dto: SelectMetaRequestDto,
    @GetMetaParams() meta: UserMetadataParams,
  ): Promise<TokensResponseDto> {
    const {
      id: sub,
      mainRole,
      roles,
      userId,
    } = await this.authSignInService.selectRole(meta.userId, dto.role);

    const branchesMeta = await this.branchesService.getRelatedBranches(
      userId,
      mainRole,
    );

    if (dto.role !== RoleEnum.Admin) {
      if (!dto.branchId) {
        throw new ForbiddenException('branchId is not provided');
      }

      if (!branchesMeta.branches.find((b) => b.branchId === dto.branchId)) {
        throw new ForbiddenException('Branch is not yours');
      }
    }

    return this.authSignInService.makeTokens({
      branches: branchesMeta.branches,
      mainBranchId: dto.role === RoleEnum.Admin ? 'ALL' : dto.branchId,
      sub,
      mainRole,
      roles,
      userId,
    });
  }

  @Get('default-meta')
  async defaultMeta(@GetMetaParams() meta: UserMetadataParams) {
    return {
      mainBranchId: meta.branchId,
      mainRole: meta.role,
    };
  }

  @Post('proxy')
  async proxyLogin(
    @GetMetaParams() meta: UserMetadataParams,
    @Body() dto: ProxyLoginRequestDto,
  ): Promise<TokensResponseDto> {
    const {
      id: sub,
      mainRole,
      roles,
      userId,
    } = await this.authSignInService.proxyLogin(
      meta.userId,
      meta.role,
      dto.proxyId,
    );

    const branchesMeta = await this.branchesService.getRelatedBranches(
      userId,
      mainRole,
    );

    return this.authSignInService.makeTokens({
      ...branchesMeta,
      sub,
      mainRole,
      roles,
      hostBranchId: meta.branchId,
      hostAuthId: meta.authId,
      hostRole: meta.role,
      hostUserId: meta.userId,
      userId,
    });
  }

  @Post('renew-auth')
  async renewAuth(
    @GetMetaParams() meta: UserMetadataParams,
  ): Promise<TokensResponseDto> {
    const {
      id: sub,
      mainRole,
      roles,
      userId,
    } = await this.authSignInService.checkAuth(meta.authId);

    const branchesMeta = await this.branchesService.getRelatedBranches(
      userId,
      meta.role,
    );

    return this.authSignInService.makeTokens({
      ...branchesMeta,
      sub,
      mainRole,
      roles,
      userId: meta.userId,
    });
  }
}
