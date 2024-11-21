import { IsInt, IsPositive } from 'class-validator';

export class CreateAccountRequestDto {
  @IsInt()
  @IsPositive()
  userId: number;
}
