import NextAuth from 'next-auth';
import { encode, decode } from 'next-auth/jwt';

import { Role } from '@/shared/auth';
import { Routes } from '@/shared/router';
import { authConfig } from './auth.config';

export const {
  handlers: { GET, POST },
  auth,
  signIn,
  signOut,
  unstable_update,
} = NextAuth({
  pages: {
    signIn: Routes.SignIn,
  },
  callbacks: {
    async signIn({ user }) {
      return !!user.id;
    },
    async session({ session, token }) {
      if (token) {
        return {
          ...session,
          user: {
            ...session.user,
            mainRole: token.mainRole as string,
            roles: token.roles as Role[],
            userId: token.userId as number,
            email: token.email as string,
            phone: token.phone as string,
          },
          tokens: {
            accessToken: token.accessToken as string,
            refreshToken: token.refreshToken as string,
          },
        };
      }

      return session;
    },

    async jwt({ token, user, trigger, session }) {
      if (trigger === 'update' && session) {
        return {
          ...token,
          accessToken: session?.tokens?.accessToken || token.accessToken,
          refreshToken: session?.tokens?.refreshToken || token.refreshToken,
          userId: session?.userId || token.userId,
          email: session?.email || token.email,
          phone: session?.phone || token.phone,
        };
      }

      if (user) {
        return {
          ...token,
          mainRole: user.mainRole,
          roles: user.roles,
          accessToken: user.accessToken,
          refreshToken: user.refreshToken,
          userId: user.userId,
          email: user.email,
          phone: user.phone,
        };
      }

      return token;
    },
  },
  session: { strategy: 'jwt' },
  jwt: { encode, decode },
  ...authConfig,
});
