import { IsEmail, IsString, MinLength } from 'class-validator';

export class LoginEmailRequestDto {
  constructor(partial: Partial<LoginEmailRequestDto>) {
    Object.assign(this, partial);
  }

  @IsEmail()
  email: string;

  @IsString()
  @MinLength(8)
  password: string;
}
