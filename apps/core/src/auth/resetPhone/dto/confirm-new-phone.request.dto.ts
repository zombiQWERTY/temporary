import { IsEmail, IsString, Length } from 'class-validator';

export class ConfirmNewPhoneRequestDto {
  constructor(partial: Partial<ConfirmNewPhoneRequestDto>) {
    Object.assign(this, partial);
  }

  @IsEmail()
  phone: string;

  @IsString()
  @Length(6)
  code: string;
}
