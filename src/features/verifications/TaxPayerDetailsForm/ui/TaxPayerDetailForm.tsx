'use client';

import { zodResolver } from '@hookform/resolvers/zod';
import { LoadingButton } from '@mui/lab';
import { Stack, Button, Box } from '@mui/material';
import { useRouter } from 'next/navigation';
import { useTranslations } from 'next-intl';
import { map } from 'ramda';
import { useEffect, useState } from 'react';
import { useForm, FormProvider } from 'react-hook-form';

import {
  fileMappers,
  UploadDocuments,
  UploadDocumentWrapperGuideline,
  UploadsHandler,
} from '@/features/uploads';
import { VerificationSection } from '@/features/verifications';
import { UploadApi, useDocumentsByType } from '@/entities/Documents';
import { useProfileEnumOptions } from '@/entities/Profiles';
import { ServerError } from '@/shared/api';
import { useUser } from '@/shared/auth';
import {
  ProfileDtoSchema,
  SourceOfInfo,
  UsaResident,
} from '@/shared/commonProjectParts';
import { useCountryCodeOptions, useToast } from '@/shared/lib';
import { Routes } from '@/shared/router';
import { Checkbox, InputTextField, SelectField } from '@/shared/ui';
import { useProvideTaxPayer } from '../lib/useProvideTaxPayer';
import {
  ProvideTaxPayerVerificationFormSchema,
  TaxPayerVerificationFormSchema,
} from '../model/types';

const defaultValues: TaxPayerVerificationFormSchema = {
  taxResidency: '',
  individualTaxpayerNumber: '',
  isUSTaxResident: '' as UsaResident,
  howDidYouHearAboutUs: '' as SourceOfInfo,
  fileIds: [],
};

const dataMappers = {
  toForm: (data: ProfileDtoSchema): TaxPayerVerificationFormSchema => {
    const obj = data.taxPayerProfile || defaultValues;
    return { ...obj, fileIds: [] };
  },
  fromForm: (
    data: TaxPayerVerificationFormSchema,
  ): ProvideTaxPayerVerificationFormSchema => {
    return {
      ...data,
      fileIds: fileMappers.fromUploaderToForm(data.fileIds),
    };
  },
};

export const TaxPayerDetailForm = () => {
  const { data, update } = useUser();
  const [agreed, setAgreed] = useState(false);
  const router = useRouter();
  const toast = useToast();

  const { taxesDocuments, isFetched } = useDocumentsByType();
  const { getUsaResidentOptions, getSourceOfInfoOptions } =
    useProfileEnumOptions();

  const form = useForm<TaxPayerVerificationFormSchema>({
    mode: 'all',
    defaultValues: data ? dataMappers.toForm(data) : defaultValues,
    resolver: zodResolver(TaxPayerVerificationFormSchema),
    disabled: !data,
  });
  const { mutateAsync } = useProvideTaxPayer();
  const { handleSubmit, setValue, formState } = form;

  useEffect(() => {
    if (isFetched && taxesDocuments.length) {
      setValue('fileIds', map(fileMappers.fromServer, taxesDocuments));
    }
  }, [taxesDocuments, isFetched, setValue]);

  const t = useTranslations('Features.Verification.TaxPayerForm');
  const tCommon = useTranslations('Common');

  const onSubmit = (values: TaxPayerVerificationFormSchema) => {
    const mappedData = dataMappers.fromForm(values);

    mutateAsync(mappedData)
      .then(update)
      .then(() => router.push(Routes.SignContract))
      .catch((e: ServerError) => {
        if (e?.error) {
          toast.error(e.error);
        }
      });
  };
  const handlePrevClick = () => {
    window.location.href = Routes.EconomicProfile;
  };

  const countryOptions = useCountryCodeOptions();

  const uploadHandler: UploadsHandler = (arg) =>
    UploadApi.request(arg).then(({ files }) =>
      files.map((f) => fileMappers.fromServer({ ...f, fileId: f.id }, true)),
    );

  return (
    <FormProvider {...form}>
      <form onSubmit={handleSubmit(onSubmit)}>
        <Stack gap={6}>
          <Stack direction="row" gap={6} alignContent="space-between">
            <SelectField
              name="taxResidency"
              label={t('Fields.tax_residency')}
              options={countryOptions}
              fullWidth
            />

            <InputTextField
              name="individualTaxpayerNumber"
              label={t('Fields.taxpayer_number')}
              fullWidth
            />
          </Stack>
          <Stack direction="row" gap={6} alignContent="space-between">
            <SelectField
              name="isUSTaxResident"
              label={t('Fields.usa_resident')}
              options={getUsaResidentOptions()}
              fullWidth
            />

            <SelectField
              name="howDidYouHearAboutUs"
              label={t('Fields.know_about_us')}
              options={getSourceOfInfoOptions()}
              fullWidth
            />
          </Stack>
          <VerificationSection
            title={t('extra_documents')}
            subtitle={t('extra_documents_subtitle')}
          >
            <UploadDocumentWrapperGuideline>
              <UploadDocuments
                name="fileIds"
                multiple
                uploadHandler={uploadHandler}
              />
            </UploadDocumentWrapperGuideline>
          </VerificationSection>
          <Stack
            direction="row"
            alignItems="flex-end"
            justifyContent="space-between"
          >
            <Box width="65%">
              <Checkbox
                label={t('confirm_submit_to_review')}
                value={agreed}
                onChange={(_, value) => setAgreed(value)}
              />
            </Box>

            <Stack
              sx={{ width: '270px' }}
              direction="row"
              alignSelf="flex-end"
              justifyContent="space-between"
            >
              <Button
                variant="secondary"
                onClick={handlePrevClick}
                sx={{ mr: 3 }}
              >
                {tCommon('back')}
              </Button>
              <LoadingButton
                disabled={!agreed}
                loading={formState.isSubmitting}
                type="submit"
              >
                {t('submit_for_review_btn')}
              </LoadingButton>
            </Stack>
          </Stack>
        </Stack>
      </form>
    </FormProvider>
  );
};
