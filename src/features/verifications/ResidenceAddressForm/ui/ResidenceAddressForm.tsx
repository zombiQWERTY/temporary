'use client';

import { zodResolver } from '@hookform/resolvers/zod';
import { LoadingButton } from '@mui/lab';
import { Stack, Button } from '@mui/material';
import { useRouter } from 'next/navigation';
import { useTranslations } from 'next-intl';
import { map } from 'ramda';
import { useEffect } from 'react';
import { useForm, FormProvider } from 'react-hook-form';

import {
  UploadDocuments,
  UploadDocumentWrapperGuideline,
  fileMappers,
  UploadsHandler,
} from '@/features/uploads';
import { VerificationSection } from '@/features/verifications';
import { UploadApi, useDocumentsByType } from '@/entities/Documents';
import { ServerError } from '@/shared/api';
import { useUser } from '@/shared/auth';
import { ProfileDtoSchema } from '@/shared/commonProjectParts';
import { useCountryCodeOptions, useToast } from '@/shared/lib';
import { Routes } from '@/shared/router';
import { InputTextField, SelectField } from '@/shared/ui';
import { useProvideLocation } from '../lib/useProvideLocation';
import {
  ProvideResidenceAddressSchema,
  ResidenceAddressFormSchema,
} from '../model/types';

const defaultValues: ResidenceAddressFormSchema = {
  countryOfResidenceCode: '',
  city: '',
  region: '',
  street: '',
  streetNo: '',
  flatNo: '',
  zipCode: '',
  fileIds: [],
};

const dataMappers = {
  toForm: (data: ProfileDtoSchema): ResidenceAddressFormSchema => {
    const obj = data.location || defaultValues;
    return { ...obj, fileIds: [] };
  },
  fromForm: (
    data: ResidenceAddressFormSchema,
  ): ProvideResidenceAddressSchema => {
    return {
      ...data,
      fileIds: fileMappers.fromUploaderToForm(data.fileIds),
    };
  },
};

export const ResidenceAddressForm = () => {
  const { data, update } = useUser();
  const router = useRouter();
  const toast = useToast();

  const { locationDocuments, isFetched } = useDocumentsByType();

  const form = useForm<ResidenceAddressFormSchema>({
    mode: 'all',
    defaultValues: data ? dataMappers.toForm(data) : defaultValues,
    resolver: zodResolver(ResidenceAddressFormSchema),
    disabled: !data,
  });
  const { mutateAsync } = useProvideLocation();
  const { handleSubmit, setValue, formState } = form;

  useEffect(() => {
    if (isFetched && locationDocuments.length) {
      setValue('fileIds', map(fileMappers.fromServer, locationDocuments));
    }
  }, [locationDocuments, isFetched, setValue]);

  const t = useTranslations('Features.Verification.ResidenceAddressForm');
  const tCommon = useTranslations('Common');

  const onSubmit = (values: ResidenceAddressFormSchema) => {
    const mappedData = dataMappers.fromForm(values);

    mutateAsync({ locationData: mappedData })
      .then(update)
      .then(() => router.push(Routes.EconomicProfile))
      .catch((e: ServerError) => {
        if (e?.error) {
          toast.error(e.error);
        }
      });
  };

  const countryOptions = useCountryCodeOptions();

  const handlePrevClick = () => {
    window.location.href = Routes.PassportDetails;
  };

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
              name="countryOfResidenceCode"
              label={t('Fields.country_of_residence')}
              options={countryOptions}
              fullWidth
            />
            <InputTextField
              name="zipCode"
              label={t('Fields.postcode')}
              fullWidth
            />
          </Stack>

          <Stack direction="row" gap={6} alignContent="space-between">
            <InputTextField
              name="region"
              label={t('Fields.region')}
              fullWidth
            />

            <InputTextField name="city" label={t('Fields.city')} fullWidth />
          </Stack>

          <InputTextField
            name="street"
            label={t('Fields.street_name')}
            fullWidth
          />

          <Stack direction="row" gap={6} alignContent="space-between">
            <InputTextField
              name="streetNo"
              label={t('Fields.street_no')}
              fullWidth
            />

            <InputTextField
              name="flatNo"
              label={t('Fields.flat_no')}
              fullWidth
            />
          </Stack>

          <UploadDocumentWrapperGuideline>
            <VerificationSection
              title={t('document_confirm_address')}
              subtitle={t('document_confirm_subtitle')}
              note={t('document_confirm_expire')}
            >
              <UploadDocuments
                name="fileIds"
                multiple
                uploadHandler={uploadHandler}
              />
            </VerificationSection>
          </UploadDocumentWrapperGuideline>

          <Stack
            sx={{ width: '200px' }}
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
              disabled={!formState.isValid}
              loading={formState.isSubmitting}
              type="submit"
            >
              {tCommon('continue')}
            </LoadingButton>
          </Stack>
        </Stack>
      </form>
    </FormProvider>
  );
};
