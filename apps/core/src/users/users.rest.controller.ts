import {
  Body,
  Controller,
  DefaultValuePipe,
  Get,
  Param,
  ParseBoolPipe,
  ParseEnumPipe,
  ParseIntPipe,
  Patch,
  Post,
  Query,
} from '@nestjs/common';

import { UsersService } from './users.service';
import { GetMetaParams, RoleEnum, UserMetadataParams } from '@erp-modul/shared';
import { UpdateMyProfileRequestDto } from './request-dto/updateMyProfileRequest.dto';
import { ChangeAccountStatusRequestDto } from './request-dto/changeAccountStatusRequest.dto';
import { CreateProfileRequestDto } from './request-dto/createProfileRequest.dto';
import { ProvidePassportToVerificationRequestDto } from './request-dto/providePassportToVerificationRequestDto';
import { AccountStatusEnum } from '../../prisma/client';
import { VerificateDocumentRequestDto } from './request-dto/verificateDocumentRequest.dto';
import { ProvideLocationToVerificationRequestDto } from './request-dto/provideLocationToVerificationRequestDto';
import { ProvideEconomicToVerificationRequestDto } from './request-dto/provideEconomicToVerificationRequestDto';
import { ProvideTaxToVerificationRequestDto } from './request-dto/provideTaxToVerificationRequestDto';
import { ConfirmVerificationRequestDto } from './request-dto/confirmVerificationRequest.dto';
import { ProvideExtraToVerificationRequestDto } from './request-dto/provideExtraToVerificationRequestDto';

@Controller('users')
export class UsersRestController {
  constructor(private readonly usersService: UsersService) {}

  @Get('profile')
  myProfile(@GetMetaParams() meta: UserMetadataParams) {
    return this.usersService.getUserProfile(meta, meta.userId);
  }

  @Get('internal-profile/:id')
  async internalMyProfile(@Param('id', ParseIntPipe) id: number) {
    const profile = await this.usersService.internalUserProfile(id);
    return { profile };
  }

  @Patch('profile')
  updateMyProfile(
    @GetMetaParams() meta: UserMetadataParams,
    @Body() dto: UpdateMyProfileRequestDto,
  ) {
    return this.usersService.updateUserProfile(meta, meta.userId, dto);
  }

  @Post()
  createUserProfile(
    @GetMetaParams() meta: UserMetadataParams,
    @Body() dto: CreateProfileRequestDto,
  ) {
    return this.usersService.createUserProfile(meta, dto);
  }

  @Get('get-users-with-documents')
  async getUsersWithDocuments(
    @Query('skip', new DefaultValuePipe(0), ParseIntPipe) skip: number,
    @Query('search', new DefaultValuePipe(null)) search: string,
    @Query('phone', new DefaultValuePipe(null)) phone: string,
    @Query('needDataVerification', new DefaultValuePipe(null), ParseBoolPipe)
    needDataVerification: boolean,
    @Query(
      'accountStatus',
      new DefaultValuePipe(null),
      new ParseEnumPipe(AccountStatusEnum, { optional: true }),
    )
    accountStatus: AccountStatusEnum,
    @GetMetaParams() meta: UserMetadataParams,
  ) {
    const take = 20;
    const users = await this.usersService.getUsersWithDocuments({
      take,
      skip: skip,
      search,
      phone,
      accountStatus,
      branchId: meta.branchId,
      needDataVerification,
    });

    return { users };
  }

  @Get('search-users/:role')
  async searchUsers(
    @Param('role') role: RoleEnum,
    @Query('term', new DefaultValuePipe(null)) term: string,
    @GetMetaParams() meta: UserMetadataParams,
  ) {
    const take = 20;
    const skip = 0;
    const users = await this.usersService.searchUsers({
      take,
      skip,
      term,
      role,
      branchId: meta.role !== RoleEnum.Admin ? meta.branchId : undefined,
    });

    return { users };
  }

  @Get('throw-error-if-not-verified')
  throwErrorIfNotVerified(@GetMetaParams() meta: UserMetadataParams) {
    return this.usersService.throwErrorIfNotVerified(meta.userId, meta.role);
  }

  @Get('verification-meta')
  verificationMeta(@GetMetaParams() meta: UserMetadataParams) {
    return this.usersService.verificationMeta(meta.userId);
  }

  @Get('user-documents')
  getUserDocuments(@GetMetaParams() meta: UserMetadataParams) {
    return this.usersService.getUserDocuments(meta.userId);
  }

  @Get('clients')
  async GetClientList(
    @GetMetaParams() meta: UserMetadataParams,
    @Query('skip', new ParseIntPipe({ optional: true })) skip = 0,
  ) {
    const take = 20;
    const list = await this.usersService.getClientsList({
      meta,
      skip,
      take,
    });

    return {
      skip,
      take,
      list,
    };
  }

  @Get(':userId')
  getProfile(
    @GetMetaParams() meta: UserMetadataParams,
    @Param('userId', ParseIntPipe) userId: number,
  ) {
    return this.usersService.getUserProfile(meta, userId);
  }

  @Patch(':userId')
  updateUserProfile(
    @Param('userId', ParseIntPipe) recipientId: number,
    @GetMetaParams() meta: UserMetadataParams,
    @Body() dto: UpdateMyProfileRequestDto,
  ) {
    return this.usersService.updateUserProfile(meta, recipientId, dto);
  }

  @Get()
  async GetProfileList(
    @GetMetaParams() meta: UserMetadataParams,
    @Query('skip', new ParseIntPipe({ optional: true })) skip = 0,
    @Query('targetRole') targetRole: RoleEnum,
  ) {
    const take = 20;
    const list = await this.usersService.getProfilesList({
      meta,
      targetRole,
      skip,
      take,
    });

    return {
      skip,
      take,
      list,
    };
  }

  @Post('change-account-status/:id')
  changeAccountStatus(
    @Param('id', ParseIntPipe) recipientId: number,
    @Body() dto: ChangeAccountStatusRequestDto,
    @GetMetaParams() meta: UserMetadataParams,
  ) {
    return this.usersService.changeAccountStatus({
      userId: recipientId,
      status: dto.status,
      failReason: dto.failReason,
      branchId: meta.branchId,
      managerId: meta.userId,
      role: meta.role,
    });
  }

  @Post('verificate-document/:userId/:documentId')
  async verificateDocument(
    @Param('userId', ParseIntPipe) userId: number,
    @Param('documentId', ParseIntPipe) documentId: number,
    @Body() dto: VerificateDocumentRequestDto,
    @GetMetaParams() meta: UserMetadataParams,
  ) {
    await this.usersService.verificateDocument(
      userId,
      documentId,
      meta.branchId,
      meta.userId,
      dto.verified,
    );

    return { ok: true };
  }

  @Post('assign-to-sales-manager/:userId/:managerId')
  async assignClientToSalesManager(
    @Param('userId', ParseIntPipe) userId: number,
    @Param('managerId', ParseIntPipe) managerId: number,
    @GetMetaParams() meta: UserMetadataParams,
  ) {
    await this.usersService.assignClientToSalesManager({
      userId,
      managerId,
      branchId: meta.branchId,
      initiatorId: meta.userId,
    });

    return { ok: true };
  }

  @Post('provide-passport-to-verification')
  providePassportToVerification(
    @Body() dto: ProvidePassportToVerificationRequestDto,
    @GetMetaParams() meta: UserMetadataParams,
  ) {
    return this.usersService.providePassportToVerification(meta.userId, dto);
  }

  @Post('provide-location-to-verification')
  provideLocationToVerification(
    @Body() dto: ProvideLocationToVerificationRequestDto,
    @GetMetaParams() meta: UserMetadataParams,
  ) {
    return this.usersService.provideLocationToVerification(meta.userId, dto);
  }

  @Post('provide-tax-to-verification')
  provideTaxToVerification(
    @Body() dto: ProvideTaxToVerificationRequestDto,
    @GetMetaParams() meta: UserMetadataParams,
  ) {
    return this.usersService.provideTaxToVerification(meta.userId, dto);
  }

  @Post('provide-extra-to-verification')
  provideExtraToVerification(
    @Body() dto: ProvideExtraToVerificationRequestDto,
    @GetMetaParams() meta: UserMetadataParams,
  ) {
    return this.usersService.provideExtraToVerification(
      meta.userId,
      dto.fileIds,
    );
  }

  @Post('provide-economic-to-verification')
  provideEconomicToVerification(
    @Body() dto: ProvideEconomicToVerificationRequestDto,
    @GetMetaParams() meta: UserMetadataParams,
  ) {
    return this.usersService.provideEconomicToVerification(meta.userId, dto);
  }

  @Post('confirm-verification')
  confirmVerification(
    @Body() dto: ConfirmVerificationRequestDto,
    @GetMetaParams() meta: UserMetadataParams,
  ) {
    return this.usersService.confirmVerification(meta.userId, dto);
  }
}
