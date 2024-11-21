export class ResetEmailResponseDto {
  constructor(partial: Partial<ResetEmailResponseDto>) {
    Object.assign(this, partial);
  }

  code: string;
  ttl: number;
}
