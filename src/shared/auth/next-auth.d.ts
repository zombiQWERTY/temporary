import 'next-auth';
import { Role } from './types';

declare module 'next-auth' {
  interface User {
    accessToken: string;
    refreshToken: string;
    mainRole: string;
    roles: Role[];
    userId: number;
    email: string;
    phone: string;
  }

  interface Session {
    tokens: {
      accessToken: string;
      refreshToken: string;
    };
  }
}
