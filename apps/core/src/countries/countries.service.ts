import { Injectable } from '@nestjs/common';
import { Country, findByIso2 } from 'country-list-js';

@Injectable()
export class CountriesService {
  findCountryByCountryCode(
    countryCode: string | null,
  ): [string, Country] | [null, null] {
    const foundCountry = countryCode
      ? findByIso2(countryCode.toUpperCase())
      : null;

    return foundCountry ? [foundCountry.code.iso2, foundCountry] : [null, null];
  }
}
