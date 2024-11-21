import {
  Body,
  Controller,
  DefaultValuePipe,
  Post,
  Query,
  Req,
} from '@nestjs/common';
import { Request } from 'express';

import { OptionalParseIntPipe } from '@erp-modul/shared/common/pipes';
import { AuthSignUpService } from './auth.signup.service';
import { RegisterResponseDto } from './dto/register.response.dto';
import { ConfirmPhoneRequestDto } from './dto/confirm-phone.request.dto';
import { RegisterRequestDto } from './dto/register.request.dto';
import { ConfirmEmailRequestDto } from './dto/confirm-email.request.dto';

@Controller('auth/signup')
export class AuthSignUpRestController {
  constructor(private readonly authSignUpService: AuthSignUpService) {}

  @Post()
  register(@Body() dto: RegisterRequestDto): Promise<RegisterResponseDto> {
    return this.authSignUpService.register(dto);
  }

  @Post('confirm-phone')
  confirmRegisteredPhone(
    @Body() { code, ...dto }: ConfirmPhoneRequestDto,
    @Req() req: Request,
    @Query('countryCode', new DefaultValuePipe(null))
    countryCode: string | null,
    @Query('lang', new DefaultValuePipe(null)) lang: string | null,
    @Query('branchId', new DefaultValuePipe(null), OptionalParseIntPipe)
    branchId: number | null,
    @Query('managerId', new DefaultValuePipe(null), OptionalParseIntPipe)
    managerId: number | null,
    @Query('utm-source', new DefaultValuePipe(null)) utmSource: string | null,
    @Query('utm-medium', new DefaultValuePipe(null)) utmMedium: string | null,
    @Query('utm-campaign', new DefaultValuePipe(null))
    utmCampaign: string | null,
    @Query('utm-content', new DefaultValuePipe(null)) utmContent: string | null,
    @Query('utm-term', new DefaultValuePipe(null)) utmTerm: string | null,
  ): Promise<{ ok: boolean }> {
    const { utmTags, inviteTags } = this.extractTags(req, {
      countryCode,
      lang,
      branchId,
      managerId,
      utmSource,
      utmMedium,
      utmCampaign,
      utmContent,
      utmTerm,
    });

    return this.authSignUpService.confirmRegistered({
      dto,
      inviteTags,
      utmTags,
      code,
      method: 'sms',
    });
  }

  @Post('confirm-email')
  confirmRegisteredEmail(
    @Body() { code, ...dto }: ConfirmEmailRequestDto,
    @Req() req: Request,
    @Query('countryCode', new DefaultValuePipe(null))
    countryCode: string | null,
    @Query('lang', new DefaultValuePipe(null)) lang: string | null,
    @Query('branchId', new DefaultValuePipe(null), OptionalParseIntPipe)
    branchId: number | null,
    @Query('managerId', new DefaultValuePipe(null), OptionalParseIntPipe)
    managerId: number | null,
    @Query('utm-source', new DefaultValuePipe(null)) utmSource: string | null,
    @Query('utm-medium', new DefaultValuePipe(null)) utmMedium: string | null,
    @Query('utm-campaign', new DefaultValuePipe(null))
    utmCampaign: string | null,
    @Query('utm-content', new DefaultValuePipe(null)) utmContent: string | null,
    @Query('utm-term', new DefaultValuePipe(null)) utmTerm: string | null,
  ): Promise<{ ok: boolean }> {
    const { utmTags, inviteTags } = this.extractTags(req, {
      countryCode,
      lang,
      branchId,
      managerId,
      utmSource,
      utmMedium,
      utmCampaign,
      utmContent,
      utmTerm,
    });

    return this.authSignUpService.confirmRegistered({
      dto,
      inviteTags,
      utmTags,
      code,
      method: 'email',
    });
  }

  private extractTags(
    req: Request,
    params: {
      countryCode: string | null;
      lang: string | null;
      branchId: number | null;
      managerId: number | null;
      utmSource: string | null;
      utmMedium: string | null;
      utmCampaign: string | null;
      utmContent: string | null;
      utmTerm: string | null;
    },
  ) {
    const {
      countryCode,
      lang,
      branchId,
      managerId,
      utmSource,
      utmMedium,
      utmCampaign,
      utmContent,
      utmTerm,
    } = params;

    const utmTags = {
      utmSource,
      utmMedium,
      utmCampaign,
      utmContent,
      utmTerm,
      userAgent: req.headers['user-agent'],
      ipAddress: req.ip,
    };

    const inviteTags = {
      branchId,
      countryCode,
      lang,
      managerId,
    };

    return { utmTags, inviteTags };
  }
}
