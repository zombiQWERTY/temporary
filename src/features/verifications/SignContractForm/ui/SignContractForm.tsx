'use client';

import { zodResolver } from '@hookform/resolvers/zod';
import { LoadingButton } from '@mui/lab';
import { Grid, Stack, Typography } from '@mui/material';
import { useRouter } from 'next/navigation';
import { useTranslations } from 'next-intl';
import { useForm, FormProvider } from 'react-hook-form';

import { useShowConfirmPinFormModal } from '@/features/confirmations';
import { OtpTypeEnum } from '@/entities/Alerts';
import { ConfirmVerificationApi } from '@/entities/Verifications';
import { useGetVerificationMeta } from '@/entities/Verifications';
import { ServerError } from '@/shared/api';
import { useUser } from '@/shared/auth';
import { ProfileDtoSchema } from '@/shared/commonProjectParts';
import { useToast } from '@/shared/lib';
import { Routes } from '@/shared/router';
import { CheckBoxField, IconLink, SquareTopDownIcon } from '@/shared/ui';
import { DocumentViewer } from '@/shared/ui';
import { useSignContractRequest } from '../lib/useSignContractRequest';
import { SignContractFormSchema } from '../model/types';

const defaultValues: SignContractFormSchema = {
  agreedToApplicationTerms: false,
  agreedToClaimsRegistrationRules: false,
  agreedToMarginTradesRules: false,
  agreedToServiceGeneralRules: false,
};

const dataMappers = {
  toForm: (data: ProfileDtoSchema): SignContractFormSchema => {
    return {
      agreedToApplicationTerms:
        data.agreedToApplicationTerms || defaultValues.agreedToApplicationTerms,
      agreedToClaimsRegistrationRules:
        data.agreedToClaimsRegistrationRules ||
        defaultValues.agreedToClaimsRegistrationRules,
      agreedToMarginTradesRules:
        data.agreedToMarginTradesRules ||
        defaultValues.agreedToMarginTradesRules,
      agreedToServiceGeneralRules:
        data.agreedToServiceGeneralRules ||
        defaultValues.agreedToServiceGeneralRules,
    };
  },
  fromForm: (
    data: SignContractFormSchema,
    code: string,
  ): ConfirmVerificationApi.ProvideConfirmVerificationArgsSchema => {
    return {
      ...data,
      code,
    };
  },
};

export const SignContractForm = () => {
  const { data, update } = useUser();
  const toast = useToast();
  const router = useRouter();

  const { response: verificationMeta } = useGetVerificationMeta();

  const form = useForm<SignContractFormSchema>({
    mode: 'onBlur',
    defaultValues: data ? dataMappers.toForm(data) : defaultValues,
    resolver: zodResolver(SignContractFormSchema),
    disabled: !data,
  });

  const { mutateAsync } = useSignContractRequest();
  const {
    handleSubmit,
    getValues,
    reset,
    formState: { isSubmitting, isValid },
  } = form;

  const t = useTranslations('Features.Verification.Confirm');

  const onCodeSubmit = async (code: string) => {
    try {
      const data = getValues();
      await mutateAsync(dataMappers.fromForm(data, code)).then(update);
      toast.success(t('request_has_been_sent'));
      router.push(Routes.Dashboard);
      reset(defaultValues);
    } catch (e: unknown) {
      const { error } = e as ServerError;
      toast.error(error);
    }
  };

  const { showModal } = useShowConfirmPinFormModal({
    eventType: OtpTypeEnum.SIGN_VERIFICATION_DOCUMENTS,
    onCodeSubmit,
  });

  return (
    <FormProvider {...form}>
      <form onSubmit={handleSubmit(showModal)}>
        <Stack direction="column" gap={12} flexWrap="nowrap">
          <Stack direction="column" gap={6}>
            <Typography variant="BodySRegular">
              {t('accept_conditions')}
            </Typography>

            <Stack direction="column" gap={4}>
              <IconLink
                target="_blank"
                startAdornment={<SquareTopDownIcon />}
                href={Routes.Dashboard}
              >
                {t('general_terms')}
              </IconLink>
              <IconLink
                target="_blank"
                startAdornment={<SquareTopDownIcon />}
                href={Routes.Dashboard}
              >
                {t('rules')}
              </IconLink>
              <IconLink
                target="_blank"
                href={Routes.Dashboard}
                startAdornment={<SquareTopDownIcon />}
              >
                {t('appendices_terms')}
              </IconLink>
            </Stack>

            <Typography variant="BodySRegular" color="grey.500">
              {t('read_text')}
            </Typography>

            {verificationMeta?.applicationFormForNaturalPersons && (
              <DocumentViewer
                url={verificationMeta?.applicationFormForNaturalPersons}
              />
            )}
          </Stack>
          <Stack direction="column" gap={6} flexWrap="nowrap">
            <CheckBoxField
              name="agreedToApplicationTerms"
              label={t('agreed_terms')}
            />
            <CheckBoxField
              name="agreedToServiceGeneralRules"
              label={t('agreed_general_rules')}
            />
            <CheckBoxField
              name="agreedToClaimsRegistrationRules"
              label={t('agreed_registration_claims')}
            />
            <CheckBoxField
              name="agreedToMarginTradesRules"
              label={t('agreed_margin_trade')}
            />
          </Stack>
          <Grid
            container
            justifyContent="space-between"
            alignItems="flex-start"
            spacing={8}
          >
            <Grid item xs={7}>
              <LoadingButton
                variant="contained"
                type="submit"
                disabled={!isValid}
                loading={isSubmitting}
              >
                {t('sign_agreement_open_account')}
              </LoadingButton>
            </Grid>
          </Grid>
        </Stack>
      </form>
    </FormProvider>
  );
};
