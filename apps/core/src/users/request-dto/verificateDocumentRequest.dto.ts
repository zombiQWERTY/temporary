import { IsBoolean } from 'class-validator';

export class VerificateDocumentRequestDto {
  @IsBoolean()
  verified: boolean;
}
