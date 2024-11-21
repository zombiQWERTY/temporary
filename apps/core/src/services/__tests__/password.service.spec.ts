import { Test } from '@nestjs/testing';
import * as argon2 from 'argon2';

import { PasswordService } from '../password.service';
import { secretsConfig } from '../../config/secrets.config';

jest.mock('argon2', () => ({
  hash: jest.fn(),
  verify: jest.fn(),
}));

jest.mock('crypto', () => {
  return jest.requireActual('crypto');
});

const secretsMock = {
  passwordPepper: 'pepper',
};

jest.mock('../../config/secrets.config', () => ({
  secretsConfig: {
    KEY: 'SECRET_KEY',
    default: jest.fn().mockImplementation(() => secretsMock),
  },
}));

describe('generateSalt', () => {
  it('should generate a salt of default length', async () => {
    const moduleRef = await Test.createTestingModule({
      providers: [
        PasswordService,
        { provide: secretsConfig.KEY, useValue: secretsMock },
      ],
    }).compile();

    const passwordService = moduleRef.get<PasswordService>(PasswordService);
    const salt = await passwordService.generateSalt();
    expect(salt).toBeInstanceOf(Buffer);
    expect(salt.length).toBe(32);
  });
});

describe('hashPassword', () => {
  it('should hash the password with provided salt', async () => {
    const moduleRef = await Test.createTestingModule({
      providers: [
        PasswordService,
        { provide: secretsConfig.KEY, useValue: secretsMock },
      ],
    }).compile();

    const passwordService = moduleRef.get<PasswordService>(PasswordService);
    const mockSalt = Buffer.from('mocksalt');
    await passwordService.hashPassword('testpassword', mockSalt);
    expect(argon2.hash).toHaveBeenCalledWith('testpasswordpepper', {
      salt: mockSalt,
    });
  });
});

describe('verifyPassword', () => {
  it('should verify the password correctly', async () => {
    const moduleRef = await Test.createTestingModule({
      providers: [
        PasswordService,
        { provide: secretsConfig.KEY, useValue: secretsMock },
      ],
    }).compile();

    const passwordService = moduleRef.get<PasswordService>(PasswordService);
    await passwordService.verifyPassword('storedhash', 'testpassword');
    expect(argon2.verify).toHaveBeenCalledWith(
      'storedhash',
      'testpasswordpepper',
    );
  });
});
