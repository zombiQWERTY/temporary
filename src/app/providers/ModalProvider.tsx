'use client';
import { FC, PropsWithChildren } from 'react';
import { ModalProvider as ReactModalProvider } from 'react-modal-hook';
import { TransitionGroup } from 'react-transition-group';

export const ModalProvider: FC<PropsWithChildren> = ({ children }) => {
  return (
    <ReactModalProvider rootComponent={TransitionGroup}>
      {children}
    </ReactModalProvider>
  );
};
