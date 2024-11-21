import {
  ArrayMaxSize,
  ArrayMinSize,
  IsInt,
  IsPositive,
  IsString,
} from 'class-validator';
import { IsBigInt, PositiveBigInt } from 'class-validator-extended';
import { Transform } from 'class-transformer';

export class CreateServiceTransactionRequestDto {
  @IsInt()
  @IsPositive()
  branchId: number;

  @IsBigInt()
  @PositiveBigInt()
  @Transform((val) => BigInt(val.value))
  amount: bigint;

  @IsInt()
  @IsPositive()
  clientId: number;

  @IsInt()
  @IsPositive()
  strategyId: number;

  @IsString()
  operationType: string;

  @IsString()
  operationStatus: string;

  @IsInt()
  @IsPositive()
  clientSubAccountId: number;

  @IsInt()
  @IsPositive()
  strategySubAccountId: number;

  @IsInt({ each: true })
  @IsPositive({ each: true })
  @ArrayMinSize(2)
  @ArrayMaxSize(2)
  originalTransactionIds: [number, number];
}
