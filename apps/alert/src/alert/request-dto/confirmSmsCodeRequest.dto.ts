import {
  IsEnum,
  IsInt,
  IsPhoneNumber,
  IsPositive,
  Length,
} from 'class-validator';
import { OtpTypeEnum } from '../../../prisma/client';

export class ConfirmSmsCodeRequestDto {
  @IsPhoneNumber()
  phone: string;

  @Length(6, 6)
  code: string;

  @IsEnum(OtpTypeEnum)
  type: OtpTypeEnum;

  @IsInt()
  @IsPositive()
  userId: number;
}
