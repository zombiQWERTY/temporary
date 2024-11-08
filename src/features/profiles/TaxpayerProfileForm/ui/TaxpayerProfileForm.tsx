'use client';
import { zodResolver } from '@hookform/resolvers/zod';
import { LoadingButton } from '@mui/lab';
import { Grid, Box } from '@mui/material';
import { useTranslations } from 'next-intl';
import { FormProvider, useForm } from 'react-hook-form';

import { useProfileEnumOptions } from '@/entities/Profiles';
import { ServerError } from '@/shared/api';
import { useUser } from '@/shared/auth';
import {
  UsaResident,
  SourceOfInfo,
  ProfileDtoSchema,
} from '@/shared/commonProjectParts';
import { useCountryCodeOptions, useToast } from '@/shared/lib';
import { InputTextField, SelectField } from '@/shared/ui';
import { useUpdateTaxpayerProfileData } from '../lib/useUpdateTaxpayerProfileData';
import { TaxpayerDataSchema } from '../model/types';

const defaultValues: TaxpayerDataSchema = {
  taxPayerProfile: {
    taxResidency: '',
    individualTaxpayerNumber: '',
    isUSTaxResident: '' as UsaResident,
    howDidYouHearAboutUs: '' as SourceOfInfo,
  },
};

const dataMappers = {
  toForm: (data: ProfileDtoSchema): TaxpayerDataSchema => {
    return {
      taxPayerProfile: data.taxPayerProfile || defaultValues.taxPayerProfile,
    };
  },
  fromForm: (data: TaxpayerDataSchema): TaxpayerDataSchema => {
    return data;
  },
};

export const TaxpayerProfileForm = () => {
  const { data: user, update } = useUser();
  const toast = useToast();
  const t = useTranslations('Profile.Forms.TaxpayerProfileData');
  const countryOptions = useCountryCodeOptions();
  const { getUsaResidentOptions, getSourceOfInfoOptions } =
    useProfileEnumOptions();

  const form = useForm<TaxpayerDataSchema>({
    mode: 'all',
    defaultValues: user ? dataMappers.toForm(user) : defaultValues,
    resolver: zodResolver(TaxpayerDataSchema),
    disabled: !user,
  });

  const {
    handleSubmit,
    formState: { isValid, isSubmitting },
  } = form;

  const { mutateAsync } = useUpdateTaxpayerProfileData();

  const onSubmit = async (values: TaxpayerDataSchema) => {
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
            <SelectField
              name="taxPayerProfile.taxResidency"
              label={t('tax_residency')}
              options={countryOptions}
              fullWidth
            />
          </Grid>
          <Grid item xs={12} md={6} lg={4}>
            <InputTextField
              name="taxPayerProfile.individualTaxpayerNumber"
              label={t('taxpayer_number')}
              fullWidth
            />
          </Grid>
          <Grid item xs={12} md={6} lg={4}>
            <SelectField
              name="taxPayerProfile.isUSTaxResident"
              label={t('usa_resident')}
              options={getUsaResidentOptions()}
              fullWidth
            />
          </Grid>
          <Grid item xs={12} md={6} lg={4}>
            <SelectField
              name="taxPayerProfile.howDidYouHearAboutUs"
              label={t('know_about_us')}
              options={getSourceOfInfoOptions()}
              fullWidth
            />
          </Grid>
        </Grid>
        <Box pt={16}>
          <LoadingButton
            variant="contained"
            type="submit"
            disabled={!isValid}
            loading={isSubmitting}
          >
            {t('save')}
          </LoadingButton>
        </Box>
      </form>
    </FormProvider>
  );
};
