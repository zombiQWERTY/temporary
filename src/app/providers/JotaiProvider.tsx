// import { Provider } from 'jotai';
import { FC, PropsWithChildren } from 'react';

export const JotaiProvider: FC<PropsWithChildren> = ({ children }) => {
  return children;
  // Uncomment when we will need Jotai
  // return <Provider>{children}</Provider>;
};
