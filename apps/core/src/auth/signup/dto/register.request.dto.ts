import { IsEmail, IsPhoneNumber } from 'class-validator';

export class RegisterRequestDto {
  constructor(partial: Partial<RegisterRequestDto>) {
    Object.assign(this, partial);
  }

  @IsPhoneNumber()
  phone: string;

  @IsEmail()
  email: string;
}
