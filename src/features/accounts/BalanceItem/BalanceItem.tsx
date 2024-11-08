import { Typography, TypographyProps } from '@mui/material';
import { formatMoney } from '@/entities/Accounts';
import { CurrencyCodes } from '@/shared/commonProjectParts';

export interface BalanceItemProps
  extends Pick<TypographyProps, 'color' | 'variant'> {
  balance: bigint;
  currencyCode: CurrencyCodes;
}

export const BalanceItem = ({
  balance,
  currencyCode,
  variant = 'bodyMedium',
  color = 'grey.400',
}: BalanceItemProps) => {
  const displayText = formatMoney(balance, currencyCode);

  return (
    <Typography variant={variant} color={color}>
      {displayText}
    </Typography>
  );
};
