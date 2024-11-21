export class ResetPhoneResponseDto {
  constructor(partial: Partial<ResetPhoneResponseDto>) {
    Object.assign(this, partial);
  }

  code: string;
  ttl: number;
}
