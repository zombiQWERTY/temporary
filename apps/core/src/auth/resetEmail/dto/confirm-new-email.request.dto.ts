import { IsEmail, IsString, Length } from 'class-validator';

export class ConfirmNewEmailRequestDto {
  constructor(partial: Partial<ConfirmNewEmailRequestDto>) {
    Object.assign(this, partial);
  }

  @IsEmail()
  email: string;

  @IsString()
  @Length(6)
  code: string;
}
