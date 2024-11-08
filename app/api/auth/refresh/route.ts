import { NextResponse } from 'next/server';
import { Session } from 'next-auth';
import { auth, signOut, unstable_update } from '@/shared/auth';

const callRefetch = async (lastSession: Session) => {
  const refreshToken = lastSession.tokens.refreshToken;

  // @TODO: rewrite to axios and api client
  const response = await fetch(
    `${process.env.NEXT_PUBLIC_API_URL}/auth/signin/renew-auth`,
    {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        Authorization: refreshToken,
      },
      body: JSON.stringify({}),
    },
  );

  if (!response.ok) {
    throw new Error(`Error: ${response.statusText}`);
  }

  return await response.json();
};

export async function POST() {
  const session = await auth();

  if (!session) {
    const res = await signOut({ redirect: false });
    return NextResponse.json(
      { redirect: res.redirect, ok: false },
      { status: 200 },
    );
  }

  try {
    // @TODO: remove any
    const result: any = await callRefetch(session);

    await unstable_update({
      tokens: {
        accessToken: result.accessToken,
        refreshToken: result.refreshToken,
      },
    });

    return NextResponse.json(
      { data: result.accessToken, ok: true },
      { status: 200 },
    );
  } catch (e: any) {
    const res = await signOut({ redirect: false });
    return NextResponse.json(
      { redirect: res.redirect, ok: false },
      { status: 200 },
    );
  }
}
