'use client';

import { usePathname } from 'next/navigation';
import { Session } from 'next-auth';
import { getCsrfToken } from 'next-auth/react';
import { PropsWithChildren, useEffect, useMemo, useState } from 'react';
import { SessionStatusEnum, SessionContext } from '@/shared/auth';

type TSessionProviderProps = PropsWithChildren<{
  session?: Session | null;
}>;

export function SessionProvider({
  session: initialSession = null,
  children,
}: TSessionProviderProps) {
  const [session, setSession] = useState<Session | null>(initialSession);
  const [loading, setLoading] = useState<boolean>(!initialSession);
  const pathname = usePathname();

  useEffect(() => {
    const fetchSession = async () => {
      if (!initialSession) {
        // @TODO: rewrite to axios and api client
        const fetchedSessionResponse: Response =
          await fetch('/api/auth/session');

        const fetchedSession =
          (await fetchedSessionResponse.json()) as Session | null;

        setSession(fetchedSession);
        setLoading(false);
      } else {
        setSession(initialSession);
        setLoading(false);
      }
    };

    fetchSession().finally();
  }, [initialSession, pathname]);

  const sessionData = useMemo(
    () => ({
      data: session,
      status: (loading
        ? 'loading'
        : session
          ? 'authenticated'
          : 'unauthenticated') as SessionStatusEnum,

      async update(data?: any) {
        if (loading || !session) {
          return;
        }

        setLoading(true);

        const fetchOptions: RequestInit = {
          headers: {
            'Content-Type': 'application/json',
          },
        };

        if (data) {
          fetchOptions.method = 'POST';
          fetchOptions.body = JSON.stringify({
            csrfToken: await getCsrfToken(),
            data,
          });
        }

        // @TODO: rewrite to axios and api client
        const fetchedSessionResponse: Response = await fetch(
          '/api/auth/session',
          fetchOptions,
        );

        let fetchedSession: Session | null = null;

        if (fetchedSessionResponse.ok) {
          fetchedSession =
            (await fetchedSessionResponse.json()) as Session | null;

          setSession(fetchedSession);
          setLoading(false);
        }

        return fetchedSession;
      },
    }),
    [loading, session],
  );

  return (
    <SessionContext.Provider value={sessionData}>
      {children}
    </SessionContext.Provider>
  );
}
