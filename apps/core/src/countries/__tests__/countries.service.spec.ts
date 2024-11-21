import { Test, TestingModule } from '@nestjs/testing';
import { CountriesService } from '../countries.service';
import * as countryListJs from 'country-list-js';

jest.mock('country-list-js', () => ({
  findByIso2: jest.fn(),
}));

describe('CountriesService', () => {
  let service: CountriesService;

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      providers: [CountriesService],
    }).compile();

    service = module.get<CountriesService>(CountriesService);
  });

  it('should be defined', () => {
    expect(service).toBeDefined();
  });

  it('should return country details for a valid country code', () => {
    const mockCountry = {
      name: 'Canada',
      code: { iso2: 'CA', iso3: 'CAN' },
    };
    (countryListJs.findByIso2 as jest.Mock).mockReturnValue(mockCountry);

    const result = service.findCountryByCountryCode('CA');
    expect(result).toEqual(['CA', mockCountry]);
    expect(countryListJs.findByIso2).toHaveBeenCalledWith('CA');
  });

  it('should return [null, null] for an invalid country code', () => {
    (countryListJs.findByIso2 as jest.Mock).mockReturnValue(null);

    const result = service.findCountryByCountryCode('XX');
    expect(result).toEqual([null, null]);
    expect(countryListJs.findByIso2).toHaveBeenCalledWith('XX');
  });

  it('should return [null, null] for null input', () => {
    const result = service.findCountryByCountryCode(null);
    expect(result).toEqual([null, null]);
  });

  it('should return [null, null] for empty string input', () => {
    const result = service.findCountryByCountryCode('');
    expect(result).toEqual([null, null]);
  });
});
