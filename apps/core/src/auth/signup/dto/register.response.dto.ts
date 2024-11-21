export class RegisterResponseDto {
  constructor(partial: Partial<RegisterResponseDto>) {
    Object.assign(this, partial);
  }

  code: string;
  ttl: number;
}
