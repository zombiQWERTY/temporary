import en from '@/shared/i18n/resources/en.json';
import zodEn from '@/shared/i18n/resources/zod/en.json';

type ZodMessages = typeof zodEn;
type Messages = typeof en;

declare global {
  interface IntlMessages extends ZodMessages, Messages {}
}
