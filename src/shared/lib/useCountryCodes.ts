import countries from 'i18n-iso-countries';
import { useLocale } from 'next-intl';

export const useCountryCodes = () => {
  const locale = useLocale();
  return countries.getNames(locale, { select: 'official' });
};
