import { IsString } from 'class-validator';

export class Location {
  @IsString()
  countryOfResidenceCode: string;

  @IsString()
  city: string;

  @IsString()
  region: string;

  @IsString()
  street: string;

  @IsString()
  streetNo: string;

  @IsString()
  flatNo: string;

  @IsString()
  zipCode: string;
}
