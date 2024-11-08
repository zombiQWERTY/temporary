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
import { InputTextField, SelectField } from '@/shared/ui';
import { useUpdateAddressData } from '../lib/useUpdateAddressData';
import { LocationDataSchema } from '../model/types';

const defaultValues: LocationDataSchema = {
  location: {
    countryOfResidenceCode: '',
    city: '',
    region: '',
    street: '',
    streetNo: '',
    flatNo: '',
    zipCode: '',
  },
};

const dataMappers = {
  toForm: (data: ProfileDtoSchema): LocationDataSchema => {
    return {
      location: data.location || defaultValues.location,
    };
  },
  fromForm: (data: LocationDataSchema): LocationDataSchema => {
    return data;
  },
};

export const AddressDetailsForm = () => {
  const { data: user, update } = useUser();
  const toast = useToast();
  const t = useTranslations('Profile.Forms.LocationData');
  const countryOptions = useCountryCodeOptions();

  const form = useForm<LocationDataSchema>({
    mode: 'all',
    defaultValues: user ? dataMappers.toForm(user) : defaultValues,
    resolver: zodResolver(LocationDataSchema),
    disabled: !user,
  });

  const {
    handleSubmit,
    formState: { isValid, isSubmitting },
  } = form;

  const { mutateAsync } = useUpdateAddressData();

  const onSubmit = async (values: LocationDataSchema) => {
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
              name="location.countryOfResidenceCode"
              label={t('country_of_residence')}
              options={countryOptions}
              fullWidth
            />
          </Grid>
          <Grid item xs={12} md={6} lg={4}>
            <InputTextField
              name="location.zipCode"
              label={t('postcode')}
              fullWidth
            />
          </Grid>
          <Grid item xs={12} md={6} lg={4}>
            <InputTextField
              name="location.region"
              label={t('region')}
              fullWidth
            />
          </Grid>
          <Grid item xs={12} md={6} lg={4}>
            <InputTextField name="location.city" label={t('city')} fullWidth />
          </Grid>
          <Grid item xs={12} md={6} lg={4}>
            <InputTextField
              name="location.street"
              label={t('street_name')}
              fullWidth
            />
          </Grid>
          <Grid item xs={12} md={6} lg={4}>
            <InputTextField
              name="location.streetNo"
              label={t('street_number')}
              fullWidth
            />
          </Grid>
          <Grid item xs={12} md={6} lg={4}>
            <InputTextField
              name="location.flatNo"
              label={t('flat_number')}
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
