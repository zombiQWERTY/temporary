'use client';
import { zodResolver } from '@hookform/resolvers/zod';
import { LoadingButton } from '@mui/lab';
import { Grid, Box } from '@mui/material';
import { useTranslations } from 'next-intl';
import { FormProvider, useForm } from 'react-hook-form';

import { ServerError } from '@/shared/api';
import { useUser } from '@/shared/auth';
import { ProfileDtoSchema } from '@/shared/commonProjectParts';
import { useCountryCodeOptions, useToast } from '@/shared/lib';
import { InputDateField, InputTextField, SelectField } from '@/shared/ui';
import { useUpdatePassportData } from '../lib/useUpdatePassportData';
import { PassportDataSchema } from '../model/types';

const defaultValues: PassportDataSchema = {
  birthdate: '' as unknown as Date,
  passport: {
    documentNumber: '',
    authorityDate: '' as unknown as Date,
    authority: '',
    citizenshipCountryCode: '',
    originCountryCode: '',
    placeOfBirth: '',
    noExpirationDate: false,
    expiryAt: '' as unknown as Date,
  },
};

const dataMappers = {
  toForm: (data: ProfileDtoSchema): PassportDataSchema => {
    const passport = data.passport;
    return {
      ...data,
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
          }
        : defaultValues.passport,
    };
  },
  fromForm: (data: PassportDataSchema): PassportDataSchema => {
    const passport = data.passport;

    return {
      birthdate: data.birthdate,
      passport: {
        ...passport,
        noExpirationDate: !passport.expiryAt,
      },
    };
  },
};

export const PassportDetailsForm = () => {
  const { data: user, update } = useUser();
  const toast = useToast();
  const t = useTranslations('Profile.Forms.PassportData');
  const countryOptions = useCountryCodeOptions();

  const form = useForm<PassportDataSchema>({
    mode: 'all',
    defaultValues: user ? dataMappers.toForm(user) : defaultValues,
    resolver: zodResolver(PassportDataSchema),
    disabled: !user,
  });

  const {
    handleSubmit,
    formState: { isDirty, isSubmitting },
  } = form;

  const { mutateAsync } = useUpdatePassportData();

  const onSubmit = async (values: PassportDataSchema) => {
    const dataToProcess = dataMappers.fromForm(values);

    try {
      await mutateAsync(dataToProcess).then(update);
    } catch (e: unknown) {
      const { error } = e as ServerError;
      toast.error(error);
      return;
    }

    toast.success(t('request_completed_successfully'));
  };

  return (
    <FormProvider {...form}>
      <form onSubmit={handleSubmit(onSubmit)}>
        <Grid container spacing={6}>
          <Grid item xs={12} md={6} lg={4}>
            <InputDateField
              name="birthdate"
              label={t('birthdate')}
              format="dd.MM.yyyy"
              fullWidth
            />
          </Grid>
          <Grid item xs={12} md={6} lg={4}>
            <InputTextField
              name="passport.documentNumber"
              label={t('document_number')}
              placeholder={t('document_number')}
              fullWidth
            />
          </Grid>
          <Grid item xs={12} md={6} lg={4}>
            <InputTextField
              name="passport.authority"
              label={t('issuing_authority')}
              placeholder={t('issuing_authority')}
              fullWidth
            />
          </Grid>
          <Grid item xs={12} md={6} lg={4}>
            <InputDateField
              name="passport.authorityDate"
              label={t('date_of_issue_of_the_document')}
              fullWidth
              format="dd.MM.yyyy"
            />
          </Grid>
          <Grid item xs={12} md={6} lg={4}>
            <InputDateField
              name="passport.expiryAt"
              label={t('document_expiry_date')}
              fullWidth
              format="dd.MM.yyyy"
            />
          </Grid>
          <Grid item xs={12} md={6} lg={4}>
            <SelectField
              name="passport.citizenshipCountryCode"
              label={t('country_of_citizenship')}
              placeholder={t('country_of_citizenship')}
              options={countryOptions}
              fullWidth
            />
          </Grid>
          <Grid item xs={12} md={6} lg={4}>
            <SelectField
              name="passport.originCountryCode"
              label={t('country_of_origin')}
              placeholder={t('country_of_origin')}
              options={countryOptions}
              fullWidth
            />
          </Grid>
          <Grid item xs={12} md={6} lg={4}>
            <InputTextField
              name="passport.placeOfBirth"
              label={t('place_of_birth')}
              placeholder={t('place_of_birth')}
              fullWidth
            />
          </Grid>
        </Grid>
        <Box pt={16}>
          <LoadingButton
            variant="contained"
            type="submit"
            disabled={!isDirty}
            loading={isSubmitting}
          >
            {t('save')}
          </LoadingButton>
        </Box>
      </form>
    </FormProvider>
  );
};
