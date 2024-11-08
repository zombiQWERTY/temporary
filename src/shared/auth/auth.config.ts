import { CredentialsSignin, NextAuthConfig } from 'next-auth';
import Credentials from 'next-auth/providers/credentials';
import { ServerError } from '@/shared/api';
import { request as signIn } from './signIn/api';

export class InvalidLoginError extends CredentialsSignin {
  static type: string;

  constructor(message?: any) {
    super();

    this.message = message;
  }
}

export const authConfig = {
  providers: [
    Credentials({
      credentials: {
        email: {},
        password: {},
      },
      async authorize(credentials) {
        try {
          const data = await signIn({
            email: credentials.email as string,
            password: credentials.password as string,
          });

          return {
            accessToken: data.accessToken,
            refreshToken: data.refreshToken,
            mainRole: data.mainRole,
            roles: data.roles,
            userId: data.userId,
            phone: data.profile.phone,
            email: data.profile.email,
          };
        } catch (e: unknown) {
          const { error } = e as ServerError;
          throw new InvalidLoginError(error);
        }
      },
    }),
  ],
  trustHost: true,
} satisfies NextAuthConfig;
