'use client';

import { Grid, Stack, Typography } from '@mui/material';
import { useLocale, useTranslations } from 'next-intl';
import { useMemo } from 'react';

import {
  useGetStrategyById,
  GetStrategyByIdApi,
} from '@/entities/TrustManagements';
import { TrustManagementRoutes } from '@/shared/router';
import { Breadcrumbs, PageTitle } from '@/shared/ui';
import { InvestButton } from './InvestButton';
import { PageContent } from './PageContent';

interface SingleProps {
  initialStrategyData: GetStrategyByIdApi.GetStrategyByIdDtoSchema | null;
  strategyId: number;
}

export const Single = (props: SingleProps) => {
  const t = useTranslations('TrustManagement.Strategy');
  const locale = useLocale();

  const { response: strategyData } = useGetStrategyById({
    initialData: props.initialStrategyData,
    strategyId: props.strategyId,
  });

  const strategy = useMemo(() => {
    if (!strategyData?.strategy) {
      return null;
    }

    return {
      ...strategyData.strategy,
      profiles: [
        strategyData.strategy.profiles.find((p) => p.language === locale)!,
      ],
    };
  }, [locale, strategyData.strategy]);

  return (
    <>
      <Grid container>
        <Grid
          item
          xs={12}
          sx={{
            pt: 11,
            px: 6,
          }}
        >
          <Breadcrumbs
            data={[
              {
                title: t('rating_of_strategies'),
                link: TrustManagementRoutes.Base,
              },
              { title: t('strategy_page'), isActive: true },
            ]}
          />
          <Stack
            direction="row"
            justifyContent="space-between"
            alignItems="baseline"
          >
            <PageTitle
              href={TrustManagementRoutes.Base}
              bottomSlot={
                <Stack>
                  <Typography variant="Heading05" color="grey.900">
                    {strategy?.profiles?.[0]?.strategyName || 'N/A'}
                  </Typography>
                  <Typography variant="BodySRegular" color="grey.300">
                    {strategy?.profiles?.[0]?.strategyDescription}
                  </Typography>
                </Stack>
              }
            />

            {strategy && (
              <InvestButton
                strategyId={props.strategyId}
                strategyCurrency={strategy.baseCurrency}
              />
            )}
          </Stack>
        </Grid>
      </Grid>
      <Grid container>
        <Grid
          item
          xs={12}
          sx={{
            pb: 8,
            px: 6,
          }}
        >
          {strategy && <PageContent strategy={strategy} />}
        </Grid>
      </Grid>
    </>
  );
};
