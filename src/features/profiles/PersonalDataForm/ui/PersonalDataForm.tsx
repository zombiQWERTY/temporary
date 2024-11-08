'use client';
import { zodResolver } from '@hookform/resolvers/zod';
import { LoadingButton } from '@mui/lab';
import { Grid, Box } from '@mui/material';
import { useTranslations } from 'next-intl';
import { FormProvider, useForm } from 'react-hook-form';
import { z } from 'zod';

import { ServerError } from '@/shared/api';
import { useUser } from '@/shared/auth';
import { ProfileDtoSchema } from '@/shared/commonProjectParts';
import { useToast } from '@/shared/lib';
import { InputTextField } from '@/shared/ui';
import { useUpdatePersonalData } from '../lib/useUpdatePersonalData';
import { PersonalDataSchema } from '../model/types';

const PersonalDataFormSchema = PersonalDataSchema.extend({
  phone: z.string(),
  email: z.string(),
});

type PersonalDataFormSchema = z.infer<typeof PersonalDataFormSchema>;

const defaultValues: PersonalDataFormSchema = {
  firstName: '',
  lastName: '',
  middleName: '',
  phone: '',
  email: '',
};

const dataMappers = {
  toForm: (data: ProfileDtoSchema): PersonalDataFormSchema => {
    return {
      firstName: data.firstName || defaultValues.firstName,
      lastName: data.lastName || defaultValues.lastName,
      middleName: data.middleName || defaultValues.middleName,
      email: data.auth?.email || defaultValues.email,
      phone: data.auth?.phone || defaultValues.phone,
    };
  },
  fromForm: (data: PersonalDataFormSchema): PersonalDataSchema => {
    return {
      firstName: data.firstName,
      lastName: data.lastName,
      middleName: data.middleName,
    };
  },
};

export const PersonalDataForm = () => {
  const { data: user, update } = useUser();
  const toast = useToast();
  const t = useTranslations('Profile.Forms.PersonalData');

  const form = useForm<PersonalDataFormSchema>({
    mode: 'all',
    defaultValues: user ? dataMappers.toForm(user) : defaultValues,
    resolver: zodResolver(PersonalDataFormSchema),
    disabled: !user,
  });

  const {
    handleSubmit,
    formState: { isDirty, isSubmitting },
  } = form;

  const { mutateAsync } = useUpdatePersonalData();

  const onSubmit = async (values: PersonalDataFormSchema) => {
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
            <InputTextField
              name="firstName"
              label={t('name')}
              placeholder={t('your_name')}
              fullWidth
            />
          </Grid>
          <Grid item xs={12} md={6} lg={4}>
            <InputTextField
              name="middleName"
              label={t('middle_name')}
              placeholder={t('your_middle_name')}
              fullWidth
            />
          </Grid>
          <Grid item xs={12} md={6} lg={4}>
            <InputTextField
              name="lastName"
              label={t('last_name')}
              placeholder={t('your_last_name')}
              fullWidth
            />
          </Grid>
          <Grid item xs={12} md={6} lg={4}>
            <InputTextField
              name="phone"
              label={t('phone')}
              fullWidth
              disabled
            />
          </Grid>
          <Grid item xs={12} md={6} lg={4}>
            <InputTextField
              name="email"
              label={t('email')}
              fullWidth
              disabled
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
