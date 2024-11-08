import { NextResponse } from 'next/server';

import { auth } from '@/shared/auth';
import {
  authRoutes,
  publicRoutes,
  defaultRedirects,
  DEFAULT_LOGIN_REDIRECT,
  Routes,
  apiAuthPrefix,
} from '@/shared/router';

export const config = {
  matcher: ['/((?!_next/static|images/|_next/image|favicon.ico).*)'],
};

export default auth(async (req) => {
  const { nextUrl } = req;

  const headers = new Headers(req.headers);
  headers.set('x-current-path', nextUrl.pathname);

  const defaultRedirect = defaultRedirects[nextUrl.pathname];

  if (defaultRedirect !== undefined) {
    return NextResponse.redirect(new URL(defaultRedirect, nextUrl));
  }

  const isLoggedIn = !!req.auth;

  const isApiAuthRoute = nextUrl.pathname.includes(apiAuthPrefix);
  const isPublicRoute = publicRoutes.includes(nextUrl.pathname);
  const isAuthRoute = authRoutes.includes(nextUrl.pathname);

  if (isApiAuthRoute) {
    return NextResponse.next({ request: { headers } });
  }

  if (req.method === 'GET') {
    if (isAuthRoute) {
      if (isLoggedIn) {
        return NextResponse.redirect(new URL(DEFAULT_LOGIN_REDIRECT, nextUrl));
      }

      return NextResponse.next({
        request: {
          headers,
        },
      });
    }

    if (!isLoggedIn && !isPublicRoute) {
      return NextResponse.redirect(new URL(Routes.SignIn, nextUrl));
    }
  }

  return NextResponse.next({
    request: {
      headers,
    },
  });
});
