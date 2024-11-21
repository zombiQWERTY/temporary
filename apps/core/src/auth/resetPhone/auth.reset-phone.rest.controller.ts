import { Body, Controller, Post } from '@nestjs/common';

import { GetMetaParams, UserMetadataParams } from '@erp-modul/shared';
import { AuthResetPhoneService } from './auth.reset-phone.service';
import { ResetPhoneResponseDto } from './dto/reset-phone.response.dto';
import { ConfirmNewPhoneRequestDto } from './dto/confirm-new-phone.request.dto';

@Controller('auth/reset-phone')
export class AuthResetPhoneRestController {
  constructor(private readonly authResetPhoneService: AuthResetPhoneService) {}

  // First new phone step
  @Post()
  newPhone(
    @GetMetaParams() meta: UserMetadataParams,
  ): Promise<ResetPhoneResponseDto> {
    return this.authResetPhoneService.resetPhone({ userId: meta.userId });
  }

  // Second new phone step
  @Post('confirm')
  confirmNewPhone(
    @Body() dto: ConfirmNewPhoneRequestDto,
    @GetMetaParams() meta: UserMetadataParams,
  ): Promise<{ ok: boolean }> {
    return this.authResetPhoneService.confirmResetPhone(
      { userId: meta.userId },
      dto.phone,
      dto.code,
    );
  }
}
