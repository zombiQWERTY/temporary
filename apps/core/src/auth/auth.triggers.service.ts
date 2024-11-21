import { Inject, Injectable, Logger } from '@nestjs/common';
import { ClientProxy } from '@nestjs/microservices';
import { timeout } from 'rxjs';

import { Auth } from '../../prisma/client';
import {
  AuditLog,
  UserMetaService,
  AUDIT_LOG_SERVICE,
  RoleEnum,
} from '@erp-modul/shared';
import { ProxyAuth } from '@erp-modul/shared/dto/auditLog';

@Injectable()
export class AuthTriggersService {
  constructor(
    @Inject(AUDIT_LOG_SERVICE)
    private readonly auditLogServiceClient: ClientProxy,
    private readonly userMetaService: UserMetaService,
  ) {}

  private logger = new Logger(AuthTriggersService.name);

  postRegistration(auth: Record<string, any>) {
    this.auditLogServiceClient
      .send<never, AuditLog.PutLogRequestDto>('put', {
        resource: 'Auth',
        event: {
          eventType: AuditLog.EventTypeEnum.Create,
          eventDescription: 'User self registered first step',
        },
        outcome: AuditLog.OutcomeEnum.Success,
        state: { newState: auth },
        user: {
          id: null,
        },
      })
      .pipe(timeout(5000))
      .subscribe({
        error: (err) =>
          this.logger.error('Unexpected send audit log error:', err),
      });
  }

  postLogin(auth: Auth, type: string) {
    const { role } = this.userMetaService.getUserMeta();

    this.auditLogServiceClient
      .send<never, AuditLog.PutLogRequestDto>('put', {
        resource: 'Auth',
        event: {
          eventType: AuditLog.EventTypeEnum.Log,
          eventDescription: 'User self logged in',
        },
        outcome: AuditLog.OutcomeEnum.Success,
        user: {
          id: auth.id,
          role,
        },
        additionalParams: {
          loginMethod: type,
        },
      })
      .pipe(timeout(5000))
      .subscribe({
        error: (err) =>
          this.logger.error('Unexpected send audit log error:', err),
      });
  }

  postProxyLogin(auth: Auth, hostUserId: number, hostUserRole: RoleEnum) {
    this.auditLogServiceClient
      .send<never, AuditLog.PutLogRequestDto>('put', {
        resource: 'Auth',
        event: {
          eventType: AuditLog.EventTypeEnum.Log,
          eventDescription: 'Proxy auth fired',
        },
        outcome: AuditLog.OutcomeEnum.Success,
        user: {
          id: hostUserId,
          role: hostUserRole,
        },
        additionalParams: {
          targetUserId: auth.userId,
        },
      })
      .pipe(timeout(5000))
      .subscribe({
        error: (err) =>
          this.logger.error('Unexpected send audit log error:', err),
      });
  }

  postPasswordReset(auth: Auth, method: string) {
    const { role } = this.userMetaService.getUserMeta();
    const { userId: proxyUserId, role: proxyUserRole } =
      this.userMetaService.getUserMeta({ useHost: true });

    const proxyAuth: ProxyAuth = {
      enabled: Boolean(proxyUserId),
      user: {
        id: proxyUserId,
        role: proxyUserRole,
      },
    };

    this.auditLogServiceClient
      .send<never, AuditLog.PutLogRequestDto>('put', {
        proxyAuth,
        resource: 'Auth',
        event: {
          eventType: AuditLog.EventTypeEnum.Log,
          eventDescription: 'User self password reset',
        },
        outcome: AuditLog.OutcomeEnum.Success,
        user: {
          id: auth.id,
          role,
        },
        additionalParams: {
          phone: auth.phone,
          method,
        },
      })
      .pipe(timeout(5000))
      .subscribe({
        error: (err) =>
          this.logger.error('Unexpected send audit log error:', err),
      });
  }

  postPhoneReset(original: Auth, updated: Auth) {
    const { role } = this.userMetaService.getUserMeta();
    const { userId: proxyUserId, role: proxyUserRole } =
      this.userMetaService.getUserMeta({ useHost: true });

    const proxyAuth: ProxyAuth = {
      enabled: Boolean(proxyUserId),
      user: {
        id: proxyUserId,
        role: proxyUserRole,
      },
    };

    this.auditLogServiceClient
      .send<never, AuditLog.PutLogRequestDto>('put', {
        proxyAuth,
        resource: 'Auth',
        event: {
          eventType: AuditLog.EventTypeEnum.Log,
          eventDescription: 'User self phone reset',
        },
        outcome: AuditLog.OutcomeEnum.Success,
        state: {
          oldState: { phone: original.phone },
          newState: { phone: updated.phone },
        },
        user: {
          id: original.id,
          role,
        },
        additionalParams: {
          phone: original.phone,
        },
      })
      .pipe(timeout(5000))
      .subscribe({
        error: (err) =>
          this.logger.error('Unexpected send audit log error:', err),
      });
  }

  postEmailReset(original: Auth, updated: Auth) {
    const { role } = this.userMetaService.getUserMeta();
    const { userId: proxyUserId, role: proxyUserRole } =
      this.userMetaService.getUserMeta({ useHost: true });

    const proxyAuth: ProxyAuth = {
      enabled: Boolean(proxyUserId),
      user: {
        id: proxyUserId,
        role: proxyUserRole,
      },
    };

    this.auditLogServiceClient
      .send<never, AuditLog.PutLogRequestDto>('put', {
        proxyAuth,
        resource: 'Auth',
        event: {
          eventType: AuditLog.EventTypeEnum.Log,
          eventDescription: 'User self email reset',
        },
        outcome: AuditLog.OutcomeEnum.Success,
        state: {
          oldState: { email: original.email },
          newState: { email: updated.email },
        },
        user: {
          id: original.id,
          role,
        },
        additionalParams: {
          email: original.email,
        },
      })
      .pipe(timeout(5000))
      .subscribe({
        error: (err) =>
          this.logger.error('Unexpected send audit log error:', err),
      });
  }

  postConfirmRegisteredPhone(auth: Auth) {
    const { role } = this.userMetaService.getUserMeta();

    this.auditLogServiceClient
      .send<never, AuditLog.PutLogRequestDto>('put', {
        resource: 'Auth',
        event: {
          eventType: AuditLog.EventTypeEnum.Log,
          eventDescription: 'User self confirmed phone',
        },
        outcome: AuditLog.OutcomeEnum.Success,
        user: {
          id: auth.id,
          role,
        },
        additionalParams: {
          phone: auth.phone,
        },
      })
      .pipe(timeout(5000))
      .subscribe({
        error: (err) =>
          this.logger.error('Unexpected send audit log error:', err),
      });
  }

  postConfirmRegisteredEmail(auth: Auth) {
    const { role } = this.userMetaService.getUserMeta();

    this.auditLogServiceClient
      .send<never, AuditLog.PutLogRequestDto>('put', {
        resource: 'Auth',
        event: {
          eventType: AuditLog.EventTypeEnum.Log,
          eventDescription: 'User self confirmed email',
        },
        outcome: AuditLog.OutcomeEnum.Success,
        user: {
          id: auth.id,
          role,
        },
        additionalParams: {
          email: auth.email,
        },
      })
      .pipe(timeout(5000))
      .subscribe({
        error: (err) =>
          this.logger.error('Unexpected send audit log error:', err),
      });
  }
}
