import { IsEmail, IsEnum, IsInt, IsOptional } from 'class-validator';
import { OtpTypeEnum } from '../../../prisma/client';

export class SendEmailCodeRequestDto {
  @IsEmail()
  email: string;

  @IsInt()
  @IsOptional()
  userId: number;

  @IsEnum(OtpTypeEnum)
  type: OtpTypeEnum;
}
