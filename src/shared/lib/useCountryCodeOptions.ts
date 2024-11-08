'use client';
import { sortBy, prop, map, compose, toPairs } from 'ramda';
import { useMemo } from 'react';
import { useCountryCodes } from './useCountryCodes';

const sortByName = sortBy(prop(1));
const mapToOptions = map(([key, value]) => ({
  label: value,
  id: key,
}));
const transformCountries = compose(mapToOptions, sortByName, toPairs);

export const useCountryCodeOptions = () => {
  const countries = useCountryCodes();

  return useMemo(() => transformCountries(countries), [countries]);
};
