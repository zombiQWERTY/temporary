import { signOut } from 'next-auth/react';

export const signOutAction = async () => {
  await signOut({ redirect: false });
  window.location.href = '/';
};
