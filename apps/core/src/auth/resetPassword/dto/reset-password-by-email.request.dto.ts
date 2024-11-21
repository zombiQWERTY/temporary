import { IsEmail } from 'class-validator';

export class ResetPasswordByEmailRequestDto {
  constructor(partial: Partial<ResetPasswordByEmailRequestDto>) {
    Object.assign(this, partial);
  }

  @IsEmail()
  email: string;
}
