import { IsString, Length, MinLength } from 'class-validator';

export class ConfirmNewPasswordRequestDto {
  constructor(partial: Partial<ConfirmNewPasswordRequestDto>) {
    Object.assign(this, partial);
  }

  @IsString()
  @MinLength(8)
  password: string;

  @IsString()
  @Length(6)
  code: string;
}
