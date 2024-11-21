import { IsEnum, IsOptional, IsString } from 'class-validator';
import { AccountStatusEnum } from '../../../prisma/client';

export class ChangeAccountStatusRequestDto {
  @IsEnum(AccountStatusEnum)
  status: AccountStatusEnum;

  @IsString()
  @IsOptional()
  failReason?: string;
}
