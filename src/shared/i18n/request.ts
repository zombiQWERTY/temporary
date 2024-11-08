import { getRequestConfig } from 'next-intl/server';
import { getUserLocale } from '@/shared/i18n';

export default getRequestConfig(async () => {
  const locale = await getUserLocale();

  return {
    locale,
    messages: {
      ...(await import(`./resources/${locale}.json`)).default,
      ...(await import(`./resources/zod/${locale}.json`)).default,
    },
  };
});
