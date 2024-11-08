import { Grid } from '@mui/material';
import { AccountActionItemsGrid } from './AccountActionItemsGrid';

export const AccountActions = () => {
  return (
    <Grid
      container
      spacing={6}
      alignItems="flex-start"
      justifyContent={{ sm: 'unset', md: 'space-between' }}
      sx={{ height: '100%', marginBlockStart: 9 }}
    >
      <AccountActionItemsGrid renderAsButtons spacing={6} />
    </Grid>
  );
};
