import { IsEmail, IsString, Length, MinLength } from 'class-validator';

export class ConfirmResetPasswordByEmailRequestDto {
  constructor(partial: Partial<ConfirmResetPasswordByEmailRequestDto>) {
    Object.assign(this, partial);
  }

  @IsEmail()
  email: string;

  @IsString()
  @MinLength(8)
  password: string;

  @IsString()
  @Length(6)
  code: string;
}
