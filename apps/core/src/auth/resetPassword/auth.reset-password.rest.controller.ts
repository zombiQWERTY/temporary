import { Body, Controller, Post } from '@nestjs/common';

import { GetMetaParams, UserMetadataParams } from '@erp-modul/shared';
import { ResetPasswordResponseDto } from './dto/reset-password.response.dto';
import { AuthResetPasswordService } from './auth.reset-password.service';
import { ResetPasswordByPhoneRequestDto } from './dto/reset-password-by-phone.request.dto';
import { ConfirmResetPasswordByPhoneRequestDto } from './dto/confirm-reset-password-by-phone.request.dto';
import { ResetPasswordByEmailRequestDto } from './dto/reset-password-by-email.request.dto';
import { ConfirmResetPasswordByEmailRequestDto } from './dto/confirm-reset-password-by-email.request.dto';
import { ConfirmNewPasswordRequestDto } from './dto/confirm-new-password.request.dto';

@Controller('auth/reset-password')
export class AuthResetPasswordRestController {
  constructor(
    private readonly authResetPasswordService: AuthResetPasswordService,
  ) {}

  // First reset password step by phone
  @Post('phone')
  resetPasswordByPhone(
    @Body() dto: ResetPasswordByPhoneRequestDto,
  ): Promise<ResetPasswordResponseDto> {
    return this.authResetPasswordService.resetPassword(
      { phone: dto.phone },
      'sms',
    );
  }

  // Second reset password step by phone
  @Post('confirm/phone')
  confirmResetPasswordByPhone(
    @Body() dto: ConfirmResetPasswordByPhoneRequestDto,
  ): Promise<{ ok: boolean }> {
    return this.authResetPasswordService.confirmResetPassword(
      { phone: dto.phone },
      dto.password,
      dto.code,
      'sms',
    );
  }

  // First reset password step by email
  @Post('email')
  resetPasswordByEmail(
    @Body() dto: ResetPasswordByEmailRequestDto,
  ): Promise<ResetPasswordResponseDto> {
    return this.authResetPasswordService.resetPassword(
      { email: dto.email },
      'email',
    );
  }

  // Second reset password step by email
  @Post('confirm/email')
  confirmResetPasswordByEmail(
    @Body() dto: ConfirmResetPasswordByEmailRequestDto,
  ): Promise<{ ok: boolean }> {
    return this.authResetPasswordService.confirmResetPassword(
      { email: dto.email },
      dto.password,
      dto.code,
      'email',
    );
  }

  // First new password step by phone
  @Post('new-password/phone')
  newPasswordByPhone(
    @GetMetaParams() meta: UserMetadataParams,
  ): Promise<ResetPasswordResponseDto> {
    return this.authResetPasswordService.resetPassword(
      { userId: meta.userId },
      'sms',
    );
  }

  // Second new password step by phone
  @Post('new-password/confirm/phone')
  confirmNewPasswordByPhone(
    @Body() dto: ConfirmNewPasswordRequestDto,
    @GetMetaParams() meta: UserMetadataParams,
  ): Promise<{ ok: boolean }> {
    return this.authResetPasswordService.confirmResetPassword(
      { userId: meta.userId },
      dto.password,
      dto.code,
      'sms',
    );
  }

  // First new password step by email
  @Post('new-password/email')
  newPasswordByEmail(
    @GetMetaParams() meta: UserMetadataParams,
  ): Promise<ResetPasswordResponseDto> {
    return this.authResetPasswordService.resetPassword(
      { userId: meta.userId },
      'email',
    );
  }

  // Second new password step by email
  @Post('new-password/confirm/email')
  confirmNewPasswordByEmail(
    @Body() dto: ConfirmNewPasswordRequestDto,
    @GetMetaParams() meta: UserMetadataParams,
  ): Promise<{ ok: boolean }> {
    return this.authResetPasswordService.confirmResetPassword(
      { userId: meta.userId },
      dto.password,
      dto.code,
      'email',
    );
  }
}
