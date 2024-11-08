'use client';
import { useTranslations } from 'next-intl';
import { useMemo } from 'react';
import { z } from 'zod';
import { makeZodI18nMap } from '../zodErrorMap';

interface UseI18nZodErrorsProps {
  tFieldNames?: ReturnType<typeof useTranslations>;
  tCustomErrors?: ReturnType<typeof useTranslations>;
}

export const useI18nZodErrors = (params?: UseI18nZodErrorsProps) => {
  const t = useTranslations('Zod');

  const errorMap = useMemo(() => makeZodI18nMap({ ...params, t }), [params, t]);
  z.setErrorMap(errorMap);
};
