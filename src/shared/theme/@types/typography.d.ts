import type {} from '@mui/material/styles';

import { CustomTypographyVariants } from '@/shared/theme/components/typographyCustomTheme';

declare module '@mui/material/styles' {
  interface TypographyVariants extends CustomTypographyVariants {}

  interface TypographyVariantsOptions
    extends Partial<CustomTypographyVariants> {}
}

declare module '@mui/material/Typography' {
  interface TypographyPropsVariantOverrides
    extends Record<keyof CustomTypographyVariants, true> {}
}
