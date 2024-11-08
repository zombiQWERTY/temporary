import { Stack, IconButton, Button } from '@mui/material';
import { useTranslations } from 'next-intl';
import { PointerEvent } from 'react';
import { AccountRoutes } from '@/shared/router';
import {
  SortVerticalIcon,
  SendIcon,
  WithdrawIcon,
  HistoryIcon,
} from '@/shared/ui';

interface AccountsTableActionsProps {
  id: number;
}

export const AccountsTableActions = ({ id }: AccountsTableActionsProps) => {
  const t = useTranslations('Features.Accounts.Table');

  const handleClick = (event: PointerEvent<HTMLAnchorElement>) => {
    event.stopPropagation();
  };

  return (
    <Stack direction="row" gap={6} alignItems="center">
      <IconButton
        variant="outlineSquare"
        href={AccountRoutes.TransferBetweenAccounts}
        onClick={handleClick}
      >
        <SendIcon color="primary" />
      </IconButton>
      <IconButton
        variant="outlineSquare"
        href={AccountRoutes.Withdraw}
        onClick={handleClick}
      >
        <WithdrawIcon color="primary" />
      </IconButton>
      <IconButton
        variant="outlineSquare"
        href={AccountRoutes.P2PTransfer}
        onClick={handleClick}
      >
        <SortVerticalIcon color="primary" />
      </IconButton>

      {/*@TODO: refactor this button below*/}
      <Button
        variant="outlined"
        size="small"
        startIcon={<HistoryIcon fontSize="small" />}
        href={`${AccountRoutes.Base}/${id}`}
        onClick={handleClick}
        sx={{
          color: (theme) => theme.palette.common.black,
          borderColor: (theme) => theme.palette.common.black,
          '&:hover': {
            color: (theme) => theme.palette.primary.dark,
          },
        }}
      >
        {t('history')}
      </Button>
    </Stack>
  );
};
