export class TokenDto {
  constructor(partial: Partial<TokenDto>) {
    Object.assign(this, partial);
  }

  sub: string;
  roles: string[];
  hostAuthId?: number;
  hostRole?: string;
  jti: string;
  exp: number;
  aud: string;
}
