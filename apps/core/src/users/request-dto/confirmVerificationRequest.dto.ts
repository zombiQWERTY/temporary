import { IsBoolean, IsString, Length, Validate } from 'class-validator';

export class ConfirmVerificationRequestDto {
  @IsBoolean()
  @Validate((value: boolean) => value === true, { message: 'Must be true' })
  agreedToApplicationTerms: boolean;

  @IsBoolean()
  @Validate((value: boolean) => value === true, { message: 'Must be true' })
  agreedToServiceGeneralRules: boolean;

  @IsBoolean()
  @Validate((value: boolean) => value === true, { message: 'Must be true' })
  agreedToClaimsRegistrationRules: boolean;

  @IsBoolean()
  @Validate((value: boolean) => value === true, { message: 'Must be true' })
  agreedToMarginTradesRules: boolean;

  @IsString()
  @Length(6)
  code: string;
}
