import { Inject, Injectable, Logger } from '@nestjs/common';
import { ClientProxy } from '@nestjs/microservices';
import { timeout } from 'rxjs';

import {
  AUDIT_LOG_SERVICE,
  AuditLog,
  RoleEnum,
  UserMetaService,
} from '@erp-modul/shared';
import { ProxyAuth } from '@erp-modul/shared/dto/auditLog';
import { User } from '../../prisma/client';

@Injectable()
export class UsersTriggersService {
  constructor(
    @Inject(AUDIT_LOG_SERVICE) private auditLogServiceClient: ClientProxy,
    private readonly userMetaService: UserMetaService,
  ) {}

  private logger = new Logger(UsersTriggersService.name);

  postUpdateSelfUser({ original, updated }: { original: User; updated: User }) {
    const { role } = this.userMetaService.getUserMeta();
    const { role: proxyRole, userId: proxyUserId } =
      this.userMetaService.getUserMeta({ useHost: true });

    const proxyAuth: ProxyAuth = {
      enabled: Boolean(proxyUserId),
      user: {
        id: proxyUserId,
        role: proxyRole,
      },
    };

    this.auditLogServiceClient
      .send<never, AuditLog.PutLogRequestDto>('put', {
        proxyAuth,
        resource: 'User',
        event: {
          eventType: AuditLog.EventTypeEnum.Update,
          eventDescription: 'User self updated',
        },
        state: { oldState: original, newState: updated },
        outcome: AuditLog.OutcomeEnum.Success,
        user: {
          id: original.id,
          role,
        },
      })
      .pipe(timeout(5000))
      .subscribe({
        error: (err) =>
          this.logger.error('Unexpected send audit log error:', err),
      });
  }

  postUpdateUser({ original, updated }: { original: User; updated: User }) {
    const { role, userId: initiatorId } = this.userMetaService.getUserMeta();
    const { role: proxyRole, userId: proxyUserId } =
      this.userMetaService.getUserMeta({ useHost: true });

    const proxyAuth: ProxyAuth = proxyUserId
      ? {
          enabled: true,
          user: {
            id: proxyUserId,
            role: proxyRole,
          },
        }
      : null;

    this.auditLogServiceClient
      .send<never, AuditLog.PutLogRequestDto>('put', {
        proxyAuth,
        resource: 'User',
        event: {
          eventType: AuditLog.EventTypeEnum.Update,
          eventDescription: 'User updated by manager',
        },
        state: { oldState: original, newState: updated },
        outcome: AuditLog.OutcomeEnum.Success,
        user: {
          id: initiatorId,
          role,
        },
      })
      .pipe(timeout(5000))
      .subscribe({
        error: (err) =>
          this.logger.error('Unexpected send audit log error:', err),
      });
  }

  postCreateUser({
    user,
    roles,
    branches,
  }: {
    user: User;
    roles: RoleEnum[];
    branches: { branchId: number; role: RoleEnum }[];
  }) {
    const { role, userId } = this.userMetaService.getUserMeta();
    const { role: proxyRole, userId: proxyUserId } =
      this.userMetaService.getUserMeta({ useHost: true });

    const proxyAuth: ProxyAuth = {
      enabled: Boolean(proxyUserId),
      user: {
        id: proxyUserId,
        role: proxyRole,
      },
    };

    this.auditLogServiceClient
      .send<never, AuditLog.PutLogRequestDto>('put', {
        proxyAuth,
        resource: 'User',
        event: {
          eventType: AuditLog.EventTypeEnum.Create,
          eventDescription: 'User created',
        },
        state: { newState: { ...user, roles, branches } },
        outcome: AuditLog.OutcomeEnum.Success,
        user: {
          id: userId,
          role,
        },
      })
      .pipe(timeout(5000))
      .subscribe({
        error: (err) =>
          this.logger.error('Unexpected send audit log error:', err),
      });
  }

  postChangeAccountStatus({
    original,
    updated,
  }: {
    original: User;
    updated: User;
  }) {
    const { role } = this.userMetaService.getUserMeta();
    const { role: proxyRole, userId: proxyUserId } =
      this.userMetaService.getUserMeta({ useHost: true });

    const proxyAuth: ProxyAuth = {
      enabled: Boolean(proxyUserId),
      user: {
        id: proxyUserId,
        role: proxyRole,
      },
    };

    this.auditLogServiceClient
      .send<never, AuditLog.PutLogRequestDto>('put', {
        proxyAuth,
        resource: 'User',
        event: {
          eventType: AuditLog.EventTypeEnum.Update,
          eventDescription: 'Manager updated user account status',
        },
        state: {
          oldState: { status: original.accountStatus },
          newState: { status: updated.accountStatus },
        },
        outcome: AuditLog.OutcomeEnum.Success,
        user: {
          id: original.id,
          role,
        },
      })
      .pipe(timeout(5000))
      .subscribe({
        error: (err) =>
          this.logger.error('Unexpected send audit log error:', err),
      });
  }

  postVerificateUserDocument({
    clientId,
    documentId,
    documentVerified,
  }: {
    clientId: number;
    documentId: number;
    documentVerified: boolean;
  }) {
    const { role, branchId, userId } = this.userMetaService.getUserMeta();
    const {
      role: proxyRole,
      userId: proxyUserId,
      branchId: proxyBranchId,
    } = this.userMetaService.getUserMeta({ useHost: true });

    const proxyAuth: ProxyAuth = {
      enabled: Boolean(proxyUserId),
      user: {
        id: proxyUserId,
        role: proxyRole,
        branchId: proxyBranchId,
      },
    };

    this.auditLogServiceClient
      .send<never, AuditLog.PutLogRequestDto>('put', {
        proxyAuth,
        resource: 'User',
        event: {
          eventType: AuditLog.EventTypeEnum.Apply,
          eventDescription: 'Compliance Manager verified user document',
        },
        state: {
          newState: {
            client: { id: clientId },
            documentId,
            documentVerified,
          },
        },
        outcome: AuditLog.OutcomeEnum.Success,
        user: {
          id: userId,
          branchId,
          role,
        },
      })
      .pipe(timeout(5000))
      .subscribe({
        error: (err) =>
          this.logger.error('Unexpected send audit log error:', err),
      });
  }
}
