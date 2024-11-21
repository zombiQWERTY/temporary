export class ResetPasswordResponseDto {
  constructor(partial: Partial<ResetPasswordResponseDto>) {
    Object.assign(this, partial);
  }

  code: string;
  ttl: number;
}
