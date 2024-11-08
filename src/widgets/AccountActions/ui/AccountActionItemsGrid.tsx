import { Grid } from '@mui/material';

import { AccountRoutes } from '@/shared/router';
import { CardBase } from '@/shared/ui';
import { useAccountActionItem } from '../lib/useAccountActionItem';
import { AccountActionButton } from './AccoutActionButton';

interface AccountActionItemsGridProps {
  renderAsButtons?: boolean;
  spacing?: number;
}

export const AccountActionItemsGrid = ({
  renderAsButtons = false,
}: AccountActionItemsGridProps) => {
  const accountActionItems = useAccountActionItem();

  return Object.values(AccountRoutes).map((route) => {
    const actionItem =
      accountActionItems[route as keyof typeof accountActionItems];

    if (!actionItem) {
      return null;
    }

    return (
      <Grid
        item
        key={route}
        xs={renderAsButtons ? undefined : 12}
        xxl={renderAsButtons ? undefined : 6}
      >
        {renderAsButtons ? (
          <AccountActionButton route={route} {...actionItem} />
        ) : (
          <CardBase
            icon={actionItem.icon}
            title={actionItem.title}
            titleDescription={actionItem.subTitle}
            href={route}
          />
        )}
      </Grid>
    );
  });
};
