import { Test, TestingModule } from '@nestjs/testing';
import { DeepMockProxy, mockDeep } from 'jest-mock-extended';
import { PrismaService } from '../prisma.service';
import { WalletNumberService } from '../wallet-number.service';
import { Prisma, PrismaClient } from '@prisma/client';

describe('WalletNumberService', () => {
  let walletNumberService: WalletNumberService;
  let prismaMock: DeepMockProxy<PrismaClient>;
  let txMock: DeepMockProxy<Prisma.TransactionClient>;

  beforeEach(async () => {
    prismaMock = mockDeep<PrismaService>();
    txMock = mockDeep<Prisma.TransactionClient>();

    const module: TestingModule = await Test.createTestingModule({
      providers: [
        WalletNumberService,
        { provide: PrismaService, useValue: prismaMock },
      ],
    }).compile();

    walletNumberService = module.get<WalletNumberService>(WalletNumberService);
  });

  describe('generateWalletId', () => {
    it('should generate a walletId starting with M and followed by 7 random digits', async () => {
      txMock.walletNumber.findUnique.mockResolvedValue(null);

      const walletId = await walletNumberService.generateWalletId(txMock);

      expect(walletId).toMatch(/^M\d{7}$/);
    });

    it('should retry if a generated walletId is not unique', async () => {
      txMock.walletNumber.findUnique
        .mockResolvedValueOnce({ id: 1, walletId: 'M1234567' })
        .mockResolvedValueOnce(null);

      const walletId = await walletNumberService.generateWalletId(txMock);

      expect(walletId).toMatch(/^M\d{7}$/);
      expect(txMock.walletNumber.findUnique).toHaveBeenCalledTimes(2);
    });
  });

  describe('generateRandomDigits', () => {
    it('should generate a string of specified length with only numeric characters', () => {
      const randomDigits = walletNumberService['generateRandomDigits'](7);

      expect(randomDigits).toHaveLength(7);
      expect(randomDigits).toMatch(/^\d{7}$/);
    });
  });

  describe('isWalletIdUnique', () => {
    it('should return true if walletId is unique', async () => {
      txMock.walletNumber.findUnique.mockResolvedValue(null);

      const isUnique = await walletNumberService['isWalletIdUnique'](
        txMock,
        'M1234567',
      );

      expect(isUnique).toBe(true);
    });

    it('should return false if walletId already exists', async () => {
      txMock.walletNumber.findUnique.mockResolvedValue({
        id: 1,
        walletId: 'M1234567',
      });

      const isUnique = await walletNumberService['isWalletIdUnique'](
        txMock,
        'M1234567',
      );

      expect(isUnique).toBe(false);
    });
  });
});
