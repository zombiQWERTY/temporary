'use client';
import { zodResolver } from '@hookform/resolvers/zod';
import { LoadingButton } from '@mui/lab';
import { Stack, Button } from '@mui/material';
import { useRouter } from 'next/navigation';
import { useTranslations } from 'next-intl';
import { dissoc, map } from 'ramda';
import { useEffect } from 'react';
import { useForm, FormProvider } from 'react-hook-form';
import { z } from 'zod';

import { fileMappers } from '@/features/uploads';
import { useDocumentsByType } from '@/entities/Documents';
import { ProvidePassportApi } from '@/entities/Verifications';
import { ServerError } from '@/shared/api';
import { useUser } from '@/shared/auth';
import { ProfileDtoSchema } from '@/shared/commonProjectParts';
import { useCountryCodeOptions, useToast } from '@/shared/lib';
import { Routes } from '@/shared/router';
import { InputDateField, InputTextField, SelectField } from '@/shared/ui';
import { useProvidePassport } from '../lib/useProvidePassport';
import { PassportDataSchema, UserDataSchema } from '../model/types';
import { PassportDetailsFormPhoto } from './PassportDetailsFormPhoto';

const ProvidePassportDetailsFormSchema = UserDataSchema.extend({
  passport: PassportDataSchema,
});

type ProvidePassportDetailsFormSchema = z.infer<
  typeof ProvidePassportDetailsFormSchema
>;

const defaultValues: ProvidePassportDetailsFormSchema = {
  firstName: '',
  lastName: '',
  birthdate: '' as unknown as Date,
  passport: {
    documentNumber: '',
    authorityDate: null as unknown as Date,
    authority: '',
    citizenshipCountryCode: '',
    originCountryCode: '',
    placeOfBirth: '',
    expiryAt: null as unknown as Date,
    noExpirationDate: false,
    firstPackFileIds: [],
    secondPackFileIds: [],
  },
};

const dataMappers = {
  toForm: (data: ProfileDtoSchema): ProvidePassportDetailsFormSchema => {
    const passport = data.passport;

    return {
      firstName: data.firstName || '',
      lastName: data.lastName || '',
      birthdate: data.birthdate ? data.birthdate : (null as unknown as Date),
      passport: passport
        ? {
            ...passport,
            authorityDate: passport.authorityDate
              ? passport.authorityDate
              : (null as unknown as Date),
            expiryAt: passport.expiryAt
              ? passport.expiryAt
              : (null as unknown as Date),
            firstPackFileIds: [],
            secondPackFileIds: [],
          }
        : defaultValues.passport,
    };
  },
  fromForm: (
    data: ProvidePassportDetailsFormSchema,
  ): {
    userData: UserDataSchema;
    passportData: ProvidePassportApi.ProvidePassportArgsSchema;
  } => {
    const passport = data.passport;

    return {
      userData: dissoc('passport', data),
      passportData: {
        ...passport,
        noExpirationDate: !passport.expiryAt,
        firstPackFileIds: fileMappers.fromUploaderToForm(
          passport.firstPackFileIds,
        ),
        secondPackFileIds: fileMappers.fromUploaderToForm(
          passport.secondPackFileIds,
        ),
      },
    };
  },
};

export const PassportDetailsForm = () => {
  const { data, update } = useUser();
  const router = useRouter();
  const toast = useToast();

  const { identityFirstPackDocuments, identitySecondPackDocuments, isFetched } =
    useDocumentsByType();

  const { mutateAsync } = useProvidePassport();

  const form = useForm<ProvidePassportDetailsFormSchema>({
    mode: 'all',
    defaultValues: data ? dataMappers.toForm(data) : defaultValues,
    resolver: zodResolver(ProvidePassportDetailsFormSchema),
    disabled: !data,
  });

  const { handleSubmit, setValue, formState } = form;

  useEffect(() => {
    if (isFetched && identityFirstPackDocuments.length) {
      setValue(
        'passport.firstPackFileIds',
        map(fileMappers.fromServer, identityFirstPackDocuments),
      );
    }
  }, [identityFirstPackDocuments, isFetched, setValue]);

  useEffect(() => {
    if (isFetched && identitySecondPackDocuments.length) {
      setValue(
        'passport.secondPackFileIds',
        map(fileMappers.fromServer, identitySecondPackDocuments),
      );
    }
  }, [identitySecondPackDocuments, isFetched, setValue]);

  const t = useTranslations('Verification');
  const tCommon = useTranslations('Common');

  const onSubmit = (values: ProvidePassportDetailsFormSchema) => {
    const mappedData = dataMappers.fromForm(values);

    mutateAsync(mappedData)
      .then(update)
      .then(() => router.push(Routes.ResidenceAddress))
      .catch((e: ServerError) => {
        if (e?.error) {
          toast.error(e.error);
        }
      });
  };

  const countryOptions = useCountryCodeOptions();

  return (
    <FormProvider {...form}>
      <form onSubmit={handleSubmit(onSubmit)}>
        <Stack gap={6}>
          <Stack direction="row" gap={6} alignContent="space-between">
            <InputTextField
              name="firstName"
              label={t('Fields.name')}
              fullWidth
            />
            <InputTextField
              name="lastName"
              label={t('Fields.lastName')}
              fullWidth
            />
          </Stack>

          <Stack direction="row" gap={6} alignContent="space-between">
            <InputDateField
              name="birthdate"
              label={t('Fields.birthdate')}
              format="dd.MM.yyyy"
              fullWidth
            />

            <InputTextField
              name="passport.documentNumber"
              label={t('Fields.document_number')}
              fullWidth
            />
          </Stack>
          <InputTextField
            name="passport.authority"
            label={t('Fields.issuing_authority')}
            fullWidth
          />
          <Stack direction="row" gap={6} alignContent="space-between">
            <InputDateField
              name="passport.authorityDate"
              label={t('Fields.date_of_issue_of_the_document')}
              fullWidth
              format="dd.MM.yyyy"
            />

            <InputDateField
              name="passport.expiryAt"
              label={t('Fields.document_expiry_date')}
              fullWidth
              format="dd.MM.yyyy"
            />
          </Stack>

          <Stack direction="row" gap={6} alignContent="space-between">
            <SelectField
              name="passport.citizenshipCountryCode"
              label={t('Fields.country_of_citizenship')}
              options={countryOptions}
              fullWidth
              defaultValue=""
            />
            <SelectField
              defaultValue=""
              name="passport.originCountryCode"
              label={t('Fields.country_of_origin')}
              options={countryOptions}
              fullWidth
            />
          </Stack>

          <InputTextField
            name="passport.placeOfBirth"
            label={t('Fields.place_of_birth')}
            fullWidth
          />

          <PassportDetailsFormPhoto />

          <Stack
            sx={{ width: '200px' }}
            direction="row"
            alignSelf="flex-end"
            justifyContent="space-between"
          >
            <Button
              disabled
              variant="secondary"
              onClick={() => router.back()}
              sx={{ mr: 3 }}
            >
              {tCommon('back')}
            </Button>
            <LoadingButton type="submit" loading={formState.isSubmitting}>
              {tCommon('continue')}
            </LoadingButton>
          </Stack>
        </Stack>
      </form>
    </FormProvider>
  );
};
