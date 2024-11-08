import countries from 'i18n-iso-countries';
import enLocaleCountries from 'i18n-iso-countries/langs/en.json';
import ruLocaleCountries from 'i18n-iso-countries/langs/ru.json';

countries.registerLocale(enLocaleCountries);
countries.registerLocale(ruLocaleCountries);

export const getCountriesData = () => countries;
