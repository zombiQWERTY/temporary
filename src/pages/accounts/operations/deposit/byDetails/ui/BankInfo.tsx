'use client';

import { Grid, Stack, Typography } from '@mui/material';
import { format } from 'date-fns';
import { useTranslations } from 'next-intl';
import { path } from 'ramda';
import { useMemo } from 'react';

import { useGetMyAccounts } from '@/entities/Accounts';
import { GetMyAccountsDtoSchema } from '@/entities/Accounts/api/getMyAccounts';
import { AccountTypeEnum } from '@/shared/commonProjectParts';
import { AgreementButtons } from './AgreementButtons';
import { OpenModalButton } from './OpenModalButton';
import { SingleValue } from './SingleValue';
import { Warnings } from './Warnings';

type BankDataKey =
  | 'iban'
  | 'swift'
  | 'address'
  | 'bankAddress'
  | 'beneficiary'
  | 'accountNumber'
  | 'paymentPurpose'
  | 'recipientBankName'
  | 'beneficiaryBank'
  | 'beneficiaryOfPayment'
  | 'correspondentBank.name'
  | 'correspondentBank.account'
  | 'correspondentBank.swift';

const bankData = {
  fib: {
    iban: 'CY40116015070002110090001254',
    swift: 'FINVCY2N',
    address:
      'Grigori Afxentiou, 13-15 I.D.E. Ioannou Court, Office 202, Mesa Geitonia, P.C. 4003, Limassol, Cyprus',
    beneficiary: 'MIND MONEY LIMITED',
    accountNumber: 'CY40116015070002110090001254',
    paymentPurpose: (account: string) =>
      `Funding of the brokerage account № ${account}, under the Service Agreement dated ${format(new Date(), 'dd.MM.yyyy')}`,
    recipientBankName:
      'FIRST INVESTMENT BANK CYPRUS INTERNATIONAL BANKING UNIT NICOSIA (LEFKOSIA), CYPRUS',
    fields: [
      ['iban', 'swift'],
      ['address', 'beneficiary'],
      ['accountNumber', 'paymentPurpose'],
      ['recipientBankName', null],
    ],
  },
  ardshin: {
    iban: '2470087371700010',
    swift: 'ASHBAM22',
    address:
      'Grigori Afxentiou, 13-15 I.D.E. Ioannou Court, Office 202, Mesa Geitonia, P.C. 4003, Limassol, Cyprus',
    bankAddress: 'Armenia, Yerevan, 13 Grigor Lusavorich Str.',
    correspondentBank: {
      name: 'Citibank, NA, US',
      account: '36209105',
      swift: 'CITIUS33',
    },
    paymentPurpose: (account: string) =>
      `Funding of the brokerage account № ${account} under the Service Agreement dated ${format(new Date(), 'dd.MM.yyyy')}.`,
    beneficiaryBank: 'ARDSHINBANK CJSC',
    beneficiaryOfPayment: 'MIND MONEY LIMITED',
    fields: [
      ['iban', 'swift'],
      ['address', 'bankAddress'],
      ['correspondentBank.name', 'paymentPurpose'],
      ['beneficiaryBank', 'beneficiaryOfPayment'],
      ['correspondentBank.account', 'correspondentBank.swift'],
    ],
  },
} as const;

interface BankInfoProps {
  id: string;
}

const getMasterWallerId = (accounts?: GetMyAccountsDtoSchema) => {
  if (!accounts) return '';

  const masterWallet = accounts.list.find(
    (account) => account.accountType === AccountTypeEnum.Master,
  );

  if (!masterWallet) return '';

  return masterWallet.walletNumber.walletId;
};

export const BankInfo = ({ id }: BankInfoProps) => {
  const selected = bankData[id as keyof typeof bankData];
  const t = useTranslations('DepositByDetails');
  const { response: accounts } = useGetMyAccounts();

  const dataMapper: Record<BankDataKey, string> = useMemo(
    () => ({
      iban: t('Bank.iban'),
      swift: t('Bank.swift'),
      address: t('Bank.address'),
      bankAddress: t('Bank.bank_address'),
      beneficiary: t('Bank.beneficiary'),
      accountNumber: t('Bank.account_number'),
      paymentPurpose: t('Bank.payment_purpose'),
      recipientBankName: t('Bank.recipient_bank_name'),
      beneficiaryBank: t('Bank.beneficiary_bank'),
      beneficiaryOfPayment: t('Bank.beneficiary_of_payment'),
      'correspondentBank.name': t('Bank.correspondent_bank_name'),
      'correspondentBank.account': t('Bank.correspondent_bank_account'),
      'correspondentBank.swift': t('Bank.correspondent_bank_swift'),
    }),
    [t],
  );

  const renderFieldSet = (fieldSet: readonly (BankDataKey | null)[]) =>
    fieldSet.map((field) => {
      if (!field) {
        return null;
      }

      const preparedValue = path(field.split('.'), selected) as
        | string
        | undefined
        | ((val: string) => string);

      let value: string;
      if (typeof preparedValue === 'function') {
        value = preparedValue(getMasterWallerId(accounts));
      } else {
        value = preparedValue as string;
      }

      return value ? (
        <Grid key={field} item xs={12} md={6} mb={8}>
          <Stack gap={1} alignItems="flex-start">
            <Typography variant="BodySMedium" color="text.secondary">
              {dataMapper[field]}
            </Typography>
            <SingleValue value={value} />
          </Stack>
        </Grid>
      ) : null;
    });

  return (
    <>
      <OpenModalButton />
      <Grid container columnSpacing={20} direction="row" mt={12}>
        {selected.fields.map(renderFieldSet)}
      </Grid>
      <Grid container>
        <Grid item xs={12} lg={7}>
          <Stack gap={8} mt={4}>
            <Warnings />
            <AgreementButtons />
          </Stack>
        </Grid>
      </Grid>
    </>
  );
};
