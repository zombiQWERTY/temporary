'use client';
import { Fade } from '@mui/material';
import {
  closeSnackbar,
  OptionsWithExtraProps,
  useSnackbar,
  VariantType,
} from 'notistack';
import { useMemo } from 'react';

export interface UseToast {
  close: (id: string) => void;
  closeAll: () => void;
  show: <V extends VariantType>(
    message: string,
    options: OptionsWithExtraProps<V>,
  ) => void;
  info: (message: string) => void;
  standart: (message: string) => void;
  success: (message: string) => void;
  warning: (message: string) => void;
  error: (message: string) => void;
}

export const useToast = (): UseToast => {
  const { enqueueSnackbar } = useSnackbar();

  const baseOptions = useMemo(
    () => ({
      preventDuplicate: true,
      TransitionComponent: Fade,
    }),
    [],
  );

  return {
    close(id: string) {
      closeSnackbar(id);
    },
    closeAll() {
      closeSnackbar();
    },
    show(message: string, options: OptionsWithExtraProps<VariantType>) {
      enqueueSnackbar(message, { ...baseOptions, ...options });
    },
    standart(message: string) {
      enqueueSnackbar(message, { ...baseOptions, variant: 'default' });
    },
    info(message: string) {
      enqueueSnackbar(message, { ...baseOptions, variant: 'info' });
    },
    success(message: string) {
      enqueueSnackbar(message, { ...baseOptions, variant: 'success' });
    },
    warning(message: string) {
      enqueueSnackbar(message, { ...baseOptions, variant: 'warning' });
    },
    error(message: string) {
      enqueueSnackbar(message, { ...baseOptions, variant: 'error' });
    },
  };
};
