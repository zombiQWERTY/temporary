'use client';

import { usePathname } from 'next/navigation';
import { PropsWithChildren, useEffect, useMemo, useState } from 'react';
import { ProfileApi } from '@/entities/Profiles';
import { validateSchema } from '@/shared/api';
import {
  useSession,
  SessionStatusEnum,
  UserContext,
  UserStatusEnum,
} from '@/shared/auth';
import { ProfileDtoSchema } from '@/shared/commonProjectParts';

type TUserProviderProps = PropsWithChildren<{
  user?: ProfileDtoSchema | null;
}>;

export function UserProvider({
  user: initialUser = null,
  children,
}: TUserProviderProps) {
  const [user, setUser] = useState<ProfileDtoSchema | null>(initialUser);
  const [loading, setLoading] = useState<boolean>(!initialUser);
  const pathname = usePathname();
  const session = useSession();

  useEffect(() => {
    const fetchUser = async () => {
      if (initialUser) {
        if (initialUser.createdAt instanceof Date) {
          setUser(initialUser);
        } else {
          setUser(
            validateSchema({
              dto: initialUser,
              schema: ProfileDtoSchema,
              schemaName: 'User',
            }),
          );
        }
      } else {
        if (session.status === SessionStatusEnum.authenticated) {
          const fetchedUser = await ProfileApi.fetchProfileRequest();
          setUser(fetchedUser);
        } else {
          setUser(null);
        }
      }
    };

    fetchUser().finally(() => {
      setLoading(false);
    });
  }, [initialUser, pathname, session.status]);

  const userData = useMemo(
    () => ({
      data: user,
      status: (loading
        ? 'loading'
        : user
          ? 'success'
          : 'error') as UserStatusEnum,

      async update() {
        if (loading || !user) {
          return null;
        }

        setLoading(true);

        try {
          const fetchedUser = await ProfileApi.fetchProfileRequest();

          setUser(fetchedUser);

          return fetchedUser;
        } catch (e: unknown) {
          setUser(null);

          console.error('Failed to fetch user');

          return null;
        } finally {
          setLoading(false);
        }
      },
    }),
    [loading, user],
  );

  return (
    <UserContext.Provider value={userData}>{children}</UserContext.Provider>
  );
}
