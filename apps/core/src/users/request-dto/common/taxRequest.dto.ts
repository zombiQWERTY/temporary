import { IsEnum, IsNotEmpty, IsString } from 'class-validator';
import { SourceOfInfo, USTaxResident } from '../../../../prisma/client';

export class Tax {
  @IsString()
  @IsNotEmpty()
  individualTaxpayerNumber: string;

  @IsString()
  @IsNotEmpty()
  taxResidency: string;

  @IsEnum(USTaxResident)
  @IsNotEmpty()
  isUSTaxResident: USTaxResident;

  @IsEnum(SourceOfInfo)
  @IsNotEmpty()
  howDidYouHearAboutUs: SourceOfInfo;
}
