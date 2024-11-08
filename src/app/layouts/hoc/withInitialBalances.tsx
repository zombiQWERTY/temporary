import React, { ComponentType, ReactElement } from 'react';
import { GetMyBalanceApi } from '@/entities/Accounts';
import { auth } from '@/shared/auth';

export function withInitialBalances<T extends object>(
  WrappedComponent: ComponentType<
    T & {
      initialBalancesData: GetMyBalanceApi.GetMyBalanceDtoSchema | undefined;
    }
  >,
) {
  return async function HOC(props: T): Promise<ReactElement> {
    const session = await auth();
    const initialBalancesData = session
      ? await GetMyBalanceApi.request().catch(() => undefined)
      : undefined;

    return (
      <WrappedComponent {...props} initialBalancesData={initialBalancesData} />
    );
  };
}
