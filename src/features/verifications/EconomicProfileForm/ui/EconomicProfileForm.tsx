'use client';

import { zodResolver } from '@hookform/resolvers/zod';
import { LoadingButton } from '@mui/lab';
import { Stack, Button } from '@mui/material';
import { useRouter } from 'next/navigation';
import { useTranslations } from 'next-intl';
import { map } from 'ramda';
import { useEffect } from 'react';
import { useForm, FormProvider } from 'react-hook-form';

import { z } from 'zod';
import { fileMappers } from '@/features/uploads';
import { VerificationSection } from '@/features/verifications';
import { isDocumentConfirmingIncomeRequired } from '@/features/verifications/EconomicProfileForm/lib/isDocumentConfirmingIncomeRequired';
import {
  EconomicVerificationFormSchema,
  ProvideEconomicVerificationFormSchema,
} from '@/features/verifications/EconomicProfileForm/model/types';
import { EconomicProfileFormConfirmingIncome } from '@/features/verifications/EconomicProfileForm/ui/EconomicProfileFormConfirmingIncome';
import { useDocumentsByType } from '@/entities/Documents';

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
import { Routes } from '@/shared/router';
import { CheckboxGroupField, InputTextField, SelectField } from '@/shared/ui';
import { useProvideEconomicProfile } from '../lib/useProvideEconomicProfile';

const defaultValues: EconomicVerificationFormSchema = {
  investedInstruments: [],
  sourceOfFunds: [],
  fileIds: [],
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
};

const dataMappers = {
  toForm: (data: ProfileDtoSchema): EconomicVerificationFormSchema => {
    const obj = data.economicProfile || defaultValues;
    return { ...obj, fileIds: [] };
  },
  fromForm: (
    data: EconomicVerificationFormSchema,
  ): ProvideEconomicVerificationFormSchema => {
    return {
      ...data,
      fileIds: fileMappers.fromUploaderToForm(data.fileIds),
    };
  },
};

export const EconomicProfileForm = () => {
  const { data, update } = useUser();
  const router = useRouter();
  const t = useTranslations('Features.Verification.EconomicProfileForm');
  const tCommon = useTranslations('Common');

  const { economicDocuments, isFetched } = useDocumentsByType();

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

  const form = useForm<EconomicVerificationFormSchema>({
    mode: 'all',
    defaultValues: data ? dataMappers.toForm(data) : defaultValues,
    resolver: zodResolver(
      EconomicVerificationFormSchema.superRefine((val, context) => {
        const isDocumentConfirmingIncomeRulesMatch =
          isDocumentConfirmingIncomeRequired({
            annualIncome: val.annualIncome,
            expectedTurnover: val.expectedTurnover,
            positionHeld: val.positionHeld,
            totalAssetValue: val.totalAssetValue,
          });

        if (isDocumentConfirmingIncomeRulesMatch && val.fileIds.length === 0) {
          context.addIssue({
            code: z.ZodIssueCode.custom,
            message: t('Form.required_confirming_income'),
            path: ['fileIds'],
          });
        }
      }),
    ),
    disabled: !data,
  });
  const { mutateAsync } = useProvideEconomicProfile();
  const { handleSubmit, setValue, formState } = form;
  const toast = useToast();

  useEffect(() => {
    if (isFetched && economicDocuments.length) {
      setValue('fileIds', map(fileMappers.fromServer, economicDocuments));
    }
  }, [economicDocuments, isFetched, setValue]);

  const onSubmit = (values: EconomicVerificationFormSchema) => {
    const mappedData = dataMappers.fromForm(values);

    mutateAsync(mappedData)
      .then(update)
      .then(() => router.push(Routes.TaxpayerDetails))
      .catch((e: ServerError) => {
        if (e?.error) {
          toast.error(e.error);
        }
      });
  };

  const handlePrevClick = () => {
    window.location.href = Routes.ResidenceAddress;
  };

  return (
    <FormProvider {...form}>
      <form onSubmit={handleSubmit(onSubmit)}>
        <Stack gap={6}>
          <Stack direction="row" gap={6} alignContent="space-between">
            <SelectField
              name="marketExperience"
              label={t('Fields.experience')}
              options={getMarketExperienceOptions()}
              fullWidth
            />

            <SelectField
              name="investedInstruments"
              label={t('Fields.financial_instruments')}
              options={getInvestedInstrumentsOptions()}
              multiple
              fullWidth
            />
          </Stack>
          <Stack direction="row" gap={6} alignContent="space-between">
            <SelectField
              name="educationLevel"
              label={t('Fields.your_education')}
              options={getEducationLevelOptions()}
              fullWidth
            />

            <SelectField
              name="investmentGoals"
              label={t('Fields.investment_objectives')}
              options={getInvestmentGoalsOptions()}
              fullWidth
            />
          </Stack>
          <Stack direction="row" gap={6} alignContent="space-between">
            <SelectField
              name="investmentDuration"
              label={t('Fields.expected_duration')}
              options={getInvestmentDurationOptions()}
              fullWidth
            />

            <SelectField
              name="tradeFrequency"
              label={t('Fields.expected_frequency')}
              options={getTradeFrequencyOptions()}
              fullWidth
            />
          </Stack>
          <Stack direction="row" gap={6} alignContent="space-between">
            <SelectField
              name="initialInvestment"
              label={t('Fields.first_year_investment')}
              options={getInvestmentRangesOptions()}
              fullWidth
            />

            <SelectField
              name="expectedTurnover"
              label={t('Fields.expected_turnover')}
              options={getInvestmentRangesOptions()}
              fullWidth
            />
          </Stack>
          <Stack direction="row" gap={6} alignContent="space-between">
            <SelectField
              name="totalAssetValue"
              label={t('Fields.cumulative_assessment')}
              options={getInvestmentRangesOptions()}
              fullWidth
            />

            <SelectField
              name="annualIncome"
              label={t('Fields.annual_income')}
              fullWidth
              options={getInvestmentRangesOptions()}
            />
          </Stack>
          <VerificationSection title={t('source_of_funds')}>
            <Stack direction="column" mb={12} flexWrap="nowrap">
              <CheckboxGroupField
                name="sourceOfFunds"
                options={getSourceOfFundsOptions()}
                fullWidth
              />
            </Stack>

            <Stack direction="column" gap={6} flexWrap="nowrap">
              <InputTextField
                name="employerNameAddress"
                label={t('Fields.employer_address_name')}
                fullWidth
              />

              <Stack direction="row" gap={6} alignContent="space-between">
                <SelectField
                  name="industrySector"
                  label={t('Fields.occupation')}
                  fullWidth
                  options={getIndustrySectorOptions()}
                />
                <SelectField
                  name="positionHeld"
                  label={t('Fields.position')}
                  fullWidth
                  options={getPositionHeldOptions()}
                />
              </Stack>

              <Stack direction="row" gap={6} alignContent="space-between">
                <SelectField
                  name="fundTransferOrigin"
                  label={t('Fields.account_country')}
                  options={countryOptions}
                  fullWidth
                />
                <SelectField
                  name="expectedTransferDestination"
                  label={t('Fields.expected_destination')}
                  options={countryOptions}
                  fullWidth
                />
              </Stack>

              <Stack direction="row" gap={6} alignContent="space-between">
                <SelectField
                  name="politicallyExposed"
                  label={t('Fields.relatives_associated')}
                  options={getPoliticallyExposedOptions()}
                  fullWidth
                />
                <SelectField
                  name="dependants"
                  label={t('Fields.number_of_dependents')}
                  options={getDependantsOptions()}
                  fullWidth
                />
              </Stack>
            </Stack>
          </VerificationSection>

          <EconomicProfileFormConfirmingIncome />

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
