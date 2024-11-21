import { IsEnum, IsInt, IsOptional, IsPhoneNumber } from 'class-validator';
import { OtpTypeEnum } from '../../../prisma/client';

export class SendSmsCodeRequestDto {
  @IsPhoneNumber()
  phone: string;

  @IsInt()
  @IsOptional()
  userId: number;

  @IsEnum(OtpTypeEnum)
  type: OtpTypeEnum;
}
