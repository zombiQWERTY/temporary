import { Inject, Injectable } from '@nestjs/common';
import { ConfigType } from '@nestjs/config';
import * as argon2 from 'argon2';
import { randomBytes } from 'crypto';
import { promisify } from 'util';

import { secretsConfig } from '../config/secrets.config';

const randomBytesAsync = promisify(randomBytes);

@Injectable()
export class PasswordService {
  constructor(
    @Inject(secretsConfig.KEY)
    private secrets: ConfigType<typeof secretsConfig>,
  ) {}

  generateSalt(length: number = 32) {
    return randomBytesAsync(length);
  }

  hashPassword(password: string, salt?: Buffer): Promise<string> {
    const passwordWithPepper = password + this.secrets.passwordPepper;
    return argon2.hash(passwordWithPepper, { salt });
  }

  verifyPassword(
    storedPasswordHash: string,
    providedPassword: string,
  ): Promise<boolean> {
    const passwordWithPepper = providedPassword + this.secrets.passwordPepper;
    return argon2.verify(storedPasswordHash, passwordWithPepper);
  }
}
