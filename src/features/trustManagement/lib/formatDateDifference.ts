import { differenceInYears, differenceInMonths, subYears } from 'date-fns';
import { useTranslations } from 'next-intl';

export const formatDateDifference = (
  startDate: Date,
  t: ReturnType<typeof useTranslations>,
  endDate = new Date(),
): string => {
  const years = differenceInYears(endDate, startDate);
  const months = differenceInMonths(endDate, subYears(startDate, years));

  if (years === 0) {
    return t('months', { count: months });
  }

  if (months === 0) {
    return t('years', { count: years });
  }

  return `${t('years', { count: years })} ${t('months', { count: months })}`;
};
