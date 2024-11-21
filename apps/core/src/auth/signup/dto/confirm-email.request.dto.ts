import {
  IsEmail,
  IsPhoneNumber,
  IsString,
  Length,
  MinLength,
} from 'class-validator';

export class ConfirmEmailRequestDto {
  constructor(partial: Partial<ConfirmEmailRequestDto>) {
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
