import { IsPhoneNumber, IsString, Length, MinLength } from 'class-validator';

export class ConfirmResetPasswordByPhoneRequestDto {
  constructor(partial: Partial<ConfirmResetPasswordByPhoneRequestDto>) {
    Object.assign(this, partial);
  }

  @IsPhoneNumber()
  phone: string;

  @IsString()
  @MinLength(8)
  password: string;

  @IsString()
  @Length(6)
  code: string;
}
