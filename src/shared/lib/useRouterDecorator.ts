'use client';

import { usePathname, useRouter, useSearchParams } from 'next/navigation';
import { AppRouterInstance } from 'next/dist/shared/lib/app-router-context.shared-runtime';

type QueryData = { [key: string]: string };

type PushDecoratorArgs = {
  pathname: string;
  query?: QueryData;
  isMergeQuery?: boolean;
};
type PushDecorator = (args: PushDecoratorArgs | string) => void;
type UpdateQuery = (query: QueryData) => void;

type UseRouterDecorator = Omit<AppRouterInstance, 'push'> & {
  push: PushDecorator;
  updateQuery: UpdateQuery;
};

const mergeQueryWithUrl = (url: string, query: URLSearchParams): string => {
  const qs = decodeURIComponent(query.toString());

  return `${url}?${qs}`;
};

export const useRouterDecorator = () => {
  const router = useRouter();
  const pathname = usePathname();
  const searchParams = useSearchParams();

  const push: PushDecorator = (args) => {
    if (typeof args === 'string') {
      router.push(args);
      return;
    }

    const { pathname, query } = args;

    let url = pathname;

    if (query) {
      const searchParams = new URLSearchParams(query);
      url = mergeQueryWithUrl(url, searchParams);
    }

    router.push(url);
  };

  const updateQuery: UpdateQuery = (query) => {
    const createQueryString = (newQuery: QueryData) => {
      const currentParams = new URLSearchParams(searchParams!.toString());

      for (const key in newQuery as any) {
        const queryName = key;
        const queryValue = newQuery[key];

        currentParams.set(queryName, queryValue);
      }

      return currentParams;
    };

    const url = mergeQueryWithUrl(pathname!, createQueryString(query));
    router.push(url);
  };

  return { ...router, push, updateQuery } as UseRouterDecorator;
};
