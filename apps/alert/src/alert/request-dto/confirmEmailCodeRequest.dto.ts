import { IsEmail, IsEnum, IsInt, IsPositive, Length } from 'class-validator';
import { OtpTypeEnum } from '../../../prisma/client';

export class ConfirmEmailCodeRequestDto {
  @IsEmail()
  email: string;

  @Length(6, 6)
  code: string;

  @IsEnum(OtpTypeEnum)
  type: OtpTypeEnum;

  @IsInt()
  @IsPositive()
  userId: number;
}
