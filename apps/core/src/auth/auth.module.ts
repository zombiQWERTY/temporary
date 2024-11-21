import { Logger, Module } from '@nestjs/common';

import { UpdateAuthService } from './auth.update-auth.service';
import { PrismaService } from '../services/prisma.service';
import { PasswordService } from '../services/password.service';
import { AuthTriggersService } from './auth.triggers.service';
import {
  createAuditLogServiceProvider,
  createAlertServiceProvider,
  UserMetaService,
} from '@erp-modul/shared';
import { BranchesModule } from '../branches/branches.module';
import { CountriesModule } from '../countries/countries.module';
import { AuthTcpController } from './auth.tcp.controller';
import { AuthCommonService } from './auth.common.service';

import { AuthResetEmailRestController } from './resetEmail/auth.reset-email.rest.controller';
import { AuthResetEmailService } from './resetEmail/auth.reset-email.service';

import { AuthResetPhoneRestController } from './resetPhone/auth.reset-phone.rest.controller';
import { AuthResetPhoneService } from './resetPhone/auth.reset-phone.service';

import { AuthResetPasswordRestController } from './resetPassword/auth.reset-password.rest.controller';
import { AuthResetPasswordService } from './resetPassword/auth.reset-password.service';

import { AuthSignUpRestController } from './signup/auth.signup.rest.controller';
import { AuthSignUpService } from './signup/auth.signup.service';

import { AuthSignInRestController } from './signin/auth.signin.rest.controller';
import { AuthSignInService } from './signin/auth.signin.service';

@Module({
  imports: [BranchesModule, CountriesModule],
  controllers: [
    AuthResetPhoneRestController,
    AuthResetEmailRestController,
    AuthResetPasswordRestController,
    AuthSignUpRestController,
    AuthSignInRestController,
    AuthTcpController,
  ],
  providers: [
    Logger,
    AuthCommonService,
    UpdateAuthService,
    AuthSignUpService,
    AuthSignInService,
    AuthResetPasswordService,
    AuthResetPhoneService,
    AuthResetEmailService,
    AuthTriggersService,
    PrismaService,
    PasswordService,
    UserMetaService,
    createAlertServiceProvider(),
    createAuditLogServiceProvider(),
  ],
  exports: [UpdateAuthService],
})
export class AuthModule {}
