import { ReactNode } from 'react';
import {
  ProgressBar as ReactProgressBar,
  ProgressBarProvider as ReactProgressBarProvider,
} from 'react-transition-progress';

export interface ProgressBarProviderProps {
  children: ReactNode;
}

export const ProgressBarProvider = ({ children }: ProgressBarProviderProps) => {
  return (
    <ReactProgressBarProvider>
      <ReactProgressBar className="top-level-progress-bar" />
      {children}
    </ReactProgressBarProvider>
  );
};
