import { IsPhoneNumber, IsString, MinLength } from 'class-validator';

export class LoginPhoneRequestDto {
  constructor(partial: Partial<LoginPhoneRequestDto>) {
    Object.assign(this, partial);
  }

  @IsPhoneNumber()
  phone: string;

  @IsString()
  @MinLength(8)
  password: string;
}
