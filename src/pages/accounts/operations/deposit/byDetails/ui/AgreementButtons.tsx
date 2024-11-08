import { Button, Stack } from '@mui/material';
import { useTranslations } from 'next-intl';
import { useGetVerificationMeta } from '@/entities/Verifications';
import { DownloadFileIcon } from '@/shared/ui';

export const AgreementButtons = () => {
  const t = useTranslations('DepositByDetails.Confirmations');

  const { response: verificationMeta } = useGetVerificationMeta();

  return (
    <Stack direction="row" gap={3} pl={6}>
      {verificationMeta?.applicationFormForNaturalPersons && (
        <Button
          variant="ghost"
          href={verificationMeta?.applicationFormForNaturalPersons}
          size="small"
          startIcon={<DownloadFileIcon />}
        >
          {t('brokerage_agreement')}
        </Button>
      )}
      {/*<Button variant="ghost" size="small" startIcon={<DownloadFileIcon />}>*/}
      {/*  {t('confirmation_of_opening_brokerage_agreement')}*/}
      {/*</Button>*/}
    </Stack>
  );
};
