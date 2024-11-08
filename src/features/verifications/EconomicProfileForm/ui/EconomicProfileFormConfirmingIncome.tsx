import { useTranslations } from 'next-intl';
import React from 'react';
import { useFormContext } from 'react-hook-form';
import {
  fileMappers,
  UploadDocuments,
  UploadDocumentWrapperGuideline,
  UploadsHandler,
} from '@/features/uploads';
import { isDocumentConfirmingIncomeRequired } from '@/features/verifications/EconomicProfileForm/lib/isDocumentConfirmingIncomeRequired';
import { UploadApi } from '@/entities/Documents';
import { VerificationSection } from '../../VerificationSection';

export const EconomicProfileFormConfirmingIncome: React.FC = () => {
  const [visible, setVisible] = React.useState(false);

  const { watch } = useFormContext();

  const t = useTranslations('Features.Verification.EconomicProfileForm');

  const uploadHandler: UploadsHandler = (arg) =>
    UploadApi.request(arg).then(({ files }) =>
      files.map((f) => fileMappers.fromServer({ ...f, fileId: f.id }, true)),
    );

  const [totalAssetValue, annualIncome, expectedTurnover, positionHeld] = watch(
    ['totalAssetValue', 'annualIncome', 'expectedTurnover', 'positionHeld'],
  );

  React.useEffect(() => {
    const isRulesMatch = isDocumentConfirmingIncomeRequired({
      annualIncome,
      expectedTurnover,
      positionHeld,
      totalAssetValue,
    });

    if (isRulesMatch) {
      setVisible(true);
    } else {
      setVisible(false);
    }
  }, [totalAssetValue, annualIncome, expectedTurnover, positionHeld]);

  if (!visible) {
    return null;
  }

  return (
    <VerificationSection
      title={t('document_confirming_income')}
      subtitle={t('document_confirming_income_subtitle')}
    >
      <UploadDocumentWrapperGuideline>
        <UploadDocuments
          name="fileIds"
          multiple
          uploadHandler={uploadHandler}
        />
      </UploadDocumentWrapperGuideline>
    </VerificationSection>
  );
};
