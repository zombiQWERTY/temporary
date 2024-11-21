import { Body, Controller, Post } from '@nestjs/common';

import { GetMetaParams, UserMetadataParams } from '@erp-modul/shared';
import { AuthResetEmailService } from './auth.reset-email.service';
import { ConfirmNewEmailRequestDto } from './dto/confirm-new-email.request.dto';
import { ResetEmailResponseDto } from './dto/reset-email.response.dto';

@Controller('auth/reset-email')
export class AuthResetEmailRestController {
  constructor(private readonly authResetEmailService: AuthResetEmailService) {}

  // First new email step
  @Post()
  newEmail(
    @GetMetaParams() meta: UserMetadataParams,
  ): Promise<ResetEmailResponseDto> {
    return this.authResetEmailService.resetEmail({ userId: meta.userId });
  }

  // Second new email step
  @Post('confirm')
  confirmNewEmail(
    @Body() dto: ConfirmNewEmailRequestDto,
    @GetMetaParams() meta: UserMetadataParams,
  ): Promise<{ ok: boolean }> {
    return this.authResetEmailService.confirmResetEmail(
      { userId: meta.userId },
      dto.email,
      dto.code,
    );
  }
}
