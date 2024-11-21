import {
  IsEmail,
  IsPhoneNumber,
  IsString,
  Length,
  MinLength,
} from 'class-validator';

export class ConfirmPhoneRequestDto {
  constructor(partial: Partial<ConfirmPhoneRequestDto>) {
    Object.assign(this, partial);
  }

  @IsPhoneNumber()
  phone: string;

  @IsEmail()
  email: string;

  @IsString()
  @MinLength(8)
  password: string;

  @IsString()
  @Length(6)
  code: string;
}
