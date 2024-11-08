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
  Dependants,
  EducationLevel,
  IndustrySector,
  InvestmentDuration,
  InvestmentGoals,
  InvestmentRanges,
  MarketExperience,
  PoliticallyExposed,
  PositionHeld,
  ProfileDtoSchema,
  TradeFrequency,
} from '@/shared/commonProjectParts';
import { useCountryCodeOptions, useToast } from '@/shared/lib';
import { InputTextField, SelectField } from '@/shared/ui';
import { useUpdateEconomicProfileData } from '../lib/useUpdateEconomicProfileData';
import { EconomicDataSchema } from '../model/types';

const defaultValues: EconomicDataSchema = {
  economicProfile: {
    investedInstruments: [],
    sourceOfFunds: [],
    fundTransferOrigin: '',
    employerNameAddress: '',
    expectedTransferDestination: '',
    marketExperience: '' as MarketExperience,
    educationLevel: '' as EducationLevel,
    investmentGoals: '' as InvestmentGoals,
    investmentDuration: '' as InvestmentDuration,
    tradeFrequency: '' as TradeFrequency,
    initialInvestment: '' as InvestmentRanges,
    expectedTurnover: '' as InvestmentRanges,
    annualIncome: '' as InvestmentRanges,
    totalAssetValue: '' as InvestmentRanges,

    industrySector: '' as IndustrySector,
    positionHeld: '' as PositionHeld,
    politicallyExposed: '' as PoliticallyExposed,
    dependants: '' as Dependants,
  },
};

const dataMappers = {
  toForm: (data: ProfileDtoSchema): EconomicDataSchema => {
    return {
      economicProfile: data.economicProfile || defaultValues.economicProfile,
    };
  },
  fromForm: (data: EconomicDataSchema): EconomicDataSchema => {
    return data;
  },
};

export const EconomicProfileForm = () => {
  const { data: user, update } = useUser();
  const toast = useToast();
  const t = useTranslations('Profile.Forms.EconomicProfileData');
  const countryOptions = useCountryCodeOptions();
  const {
    getPoliticallyExposedOptions,
    getEducationLevelOptions,
    getIndustrySectorOptions,
    getInvestedInstrumentsOptions,
    getInvestmentDurationOptions,
    getInvestmentGoalsOptions,
    getInvestmentRangesOptions,
    getMarketExperienceOptions,
    getDependantsOptions,
    getSourceOfFundsOptions,
    getTradeFrequencyOptions,
    getPositionHeldOptions,
  } = useProfileEnumOptions();

  const form = useForm<EconomicDataSchema>({
    mode: 'all',
    defaultValues: user ? dataMappers.toForm(user) : defaultValues,
    resolver: zodResolver(EconomicDataSchema),
    disabled: !user,
  });

  const {
    handleSubmit,
    formState: { isValid, isSubmitting },
  } = form;

  const { mutateAsync } = useUpdateEconomicProfileData();

  const onSubmit = async (values: EconomicDataSchema) => {
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
              name="economicProfile.marketExperience"
              label={t('experience')}
              options={getMarketExperienceOptions()}
              fullWidth
            />
          </Grid>
          <Grid item xs={12} md={6} lg={4}>
            <SelectField
              name="economicProfile.investedInstruments"
              label={t('financial_instruments')}
              options={getInvestedInstrumentsOptions()}
              multiple
              fullWidth
            />
          </Grid>
          <Grid item xs={12} md={6} lg={4}>
            <SelectField
              name="economicProfile.educationLevel"
              label={t('your_education')}
              options={getEducationLevelOptions()}
              fullWidth
            />
          </Grid>
          <Grid item xs={12} md={6} lg={4}>
            <SelectField
              name="economicProfile.investmentGoals"
              label={t('investment_objectives')}
              options={getInvestmentGoalsOptions()}
              fullWidth
            />
          </Grid>
          <Grid item xs={12} md={6} lg={4}>
            <SelectField
              name="economicProfile.investmentDuration"
              label={t('expected_duration')}
              options={getInvestmentDurationOptions()}
              fullWidth
            />
          </Grid>
          <Grid item xs={12} md={6} lg={4}>
            <SelectField
              name="economicProfile.tradeFrequency"
              label={t('expected_frequency')}
              options={getTradeFrequencyOptions()}
              fullWidth
            />
          </Grid>
          <Grid item xs={12} md={6} lg={4}>
            <SelectField
              name="economicProfile.initialInvestment"
              label={t('first_year_investment')}
              options={getInvestmentRangesOptions()}
              fullWidth
            />
          </Grid>
          <Grid item xs={12} md={6} lg={4}>
            <SelectField
              name="economicProfile.expectedTurnover"
              label={t('expected_turnover')}
              options={getInvestmentRangesOptions()}
              fullWidth
            />
          </Grid>
          <Grid item xs={12} md={6} lg={4}>
            <SelectField
              name="economicProfile.totalAssetValue"
              label={t('cumulative_assessment')}
              options={getInvestmentRangesOptions()}
              fullWidth
            />
          </Grid>
          <Grid item xs={12} md={6} lg={4}>
            <SelectField
              name="economicProfile.annualIncome"
              label={t('annual_income')}
              fullWidth
              options={getInvestmentRangesOptions()}
            />
          </Grid>
          <Grid item xs={12} md={6} lg={4}>
            <SelectField
              name="economicProfile.sourceOfFunds"
              label={t('source_of_funds')}
              options={getSourceOfFundsOptions()}
              multiple
              fullWidth
            />
          </Grid>
          <Grid item xs={12} md={6} lg={4}>
            <InputTextField
              name="economicProfile.employerNameAddress"
              label={t('employer_address_name')}
              fullWidth
            />
          </Grid>
          <Grid item xs={12} md={6} lg={4}>
            <SelectField
              name="economicProfile.industrySector"
              label={t('occupation')}
              fullWidth
              options={getIndustrySectorOptions()}
            />
          </Grid>
          <Grid item xs={12} md={6} lg={4}>
            <SelectField
              name="economicProfile.positionHeld"
              label={t('position')}
              fullWidth
              options={getPositionHeldOptions()}
            />
          </Grid>
          <Grid item xs={12} md={6} lg={4}>
            <SelectField
              name="economicProfile.fundTransferOrigin"
              label={t('account_country')}
              options={countryOptions}
              fullWidth
            />
          </Grid>
          <Grid item xs={12} md={6} lg={4}>
            <SelectField
              name="economicProfile.expectedTransferDestination"
              label={t('expected_destination')}
              options={countryOptions}
              fullWidth
            />
          </Grid>
          <Grid item xs={12} md={6} lg={4}>
            <SelectField
              name="economicProfile.politicallyExposed"
              label={t('relatives_associated')}
              options={getPoliticallyExposedOptions()}
              fullWidth
            />
          </Grid>
          <Grid item xs={12} md={6} lg={4}>
            <SelectField
              name="economicProfile.dependants"
              label={t('number_of_dependents')}
              options={getDependantsOptions()}
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
