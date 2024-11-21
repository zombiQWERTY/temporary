import { ArrayNotEmpty, IsInt, IsPositive } from 'class-validator';

export class GetStrategyAmountsTMRequestDto {
  @IsInt()
  @IsPositive()
  userId: number;

  @ArrayNotEmpty()
  @IsInt({ each: true })
  strategyIds: number[];

  @ArrayNotEmpty()
  @IsInt({ each: true })
  transactionIds: number[];
}
