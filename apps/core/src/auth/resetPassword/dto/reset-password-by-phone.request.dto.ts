import { IsPhoneNumber } from 'class-validator';

export class ResetPasswordByPhoneRequestDto {
  constructor(partial: Partial<ResetPasswordByPhoneRequestDto>) {
    Object.assign(this, partial);
  }

  @IsPhoneNumber()
  phone: string;
}
