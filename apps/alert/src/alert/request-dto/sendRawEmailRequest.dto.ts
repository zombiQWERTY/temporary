import {
  IsBoolean,
  IsEmail,
  IsObject,
  IsOptional,
  IsString,
  ValidateNested,
} from 'class-validator';
import { Type } from 'class-transformer';

class Extra {
  @IsBoolean()
  @IsOptional()
  useHtmlTemplate?: boolean;

  @IsString()
  @IsOptional()
  templateId?: string;

  @IsBoolean()
  @IsOptional()
  fromBackoffice?: boolean;

  @IsObject()
  @IsOptional()
  data?: Record<string, any>;
}

export class SendRawEmailRequestDto {
  @IsEmail()
  email: string;

  @IsString()
  text: string;

  @IsString()
  subject: string;

  @Type(() => Extra)
  @IsOptional()
  @ValidateNested()
  extra?: Extra;
}
