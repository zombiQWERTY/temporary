import { Injectable } from '@nestjs/common';
import { PrismaService } from './prisma.service';
import { Prisma } from '../../prisma/client';

@Injectable()
export class WalletNumberService {
  constructor(private readonly prisma: PrismaService) {}

  async generateWalletId(tx: Prisma.TransactionClient): Promise<string> {
    const generateUniqueWalletId = async (): Promise<string> => {
      const newWalletId = 'M' + this.generateRandomDigits(7);
      const isUnique = await this.isWalletIdUnique(tx, newWalletId);

      return isUnique ? newWalletId : await generateUniqueWalletId();
    };

    return generateUniqueWalletId();
  }

  private generateRandomDigits(length: number): string {
    return Array.from({ length }, () =>
      Math.floor(Math.random() * 10).toString(),
    ).join('');
  }

  private async isWalletIdUnique(
    tx: Prisma.TransactionClient,
    walletId: string,
  ): Promise<boolean> {
    const existingWallet = await tx.walletNumber.findUnique({
      where: {
        walletId,
      },
    });

    return !existingWallet;
  }
}
