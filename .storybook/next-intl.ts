import en from '../src/shared/i18n/resources/en.json';
import ru from '../src/shared/i18n/resources/ru.json';

const messagesByLocale: Record<string, any> = { en, ru };

const nextIntl = {
  defaultLocale: 'en',
  messagesByLocale,
};

export default nextIntl;
