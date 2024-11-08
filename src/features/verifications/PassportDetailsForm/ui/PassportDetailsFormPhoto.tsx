import { useTranslations } from 'next-intl';

import {
  UploadDocumentWrapperGuideline,
  UploadDocuments,
  UploadsHandler,
  fileMappers,
} from '@/features/uploads';
import { VerificationSection } from '@/features/verifications';
import { UploadApi } from '@/entities/Documents';

export const PassportDetailsFormPhoto = () => {
  const t = useTranslations('Verification.PassportDetails');

  const uploadHandler: UploadsHandler = (arg) =>
    UploadApi.request(arg).then(({ files }) =>
      files.map((f) => fileMappers.fromServer({ ...f, fileId: f.id }, true)),
    );

  return (
    <UploadDocumentWrapperGuideline>
      <VerificationSection title={t('passport_photo')}>
        <UploadDocuments
          name="passport.firstPackFileIds"
          multiple
          uploadHandler={uploadHandler}
        />
      </VerificationSection>
      <VerificationSection
        title={t('second_document')}
        subtitle={t('upload_any_document')}
      >
        <UploadDocuments
          name="passport.secondPackFileIds"
          multiple
          uploadHandler={uploadHandler}
        />
      </VerificationSection>
    </UploadDocumentWrapperGuideline>
  );
};
