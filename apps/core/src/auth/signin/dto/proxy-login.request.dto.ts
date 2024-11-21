import { IsPositive } from 'class-validator';

export class ProxyLoginRequestDto {
  constructor(partial: Partial<ProxyLoginRequestDto>) {
    Object.assign(this, partial);
  }

  @IsPositive()
  proxyId: number;
}
