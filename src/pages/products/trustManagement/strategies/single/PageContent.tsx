'use client';

import { useTranslations } from 'next-intl';
import { SyntheticEvent, useState, FC, PropsWithChildren } from 'react';

import { GetStrategyByIdApi } from '@/entities/TrustManagements';
import { Tab, Tabs } from '@/shared/ui';
import { About } from './About';
import { FAQ } from './FAQ';
import { Instruments } from './Instruments';
import { Profitability } from './Profitability';
import { Risks } from './Risks';

interface PageContentProps {
  strategy: GetStrategyByIdApi.StrategySchema;
}

interface TabPanelProps {
  index: number;
  value: number;
}

const TabPanel = ({
  children,
  index,
  value,
}: PropsWithChildren<TabPanelProps>) => {
  return value === index ? children : null;
};

export const PageContent: FC<PageContentProps> = ({ strategy }) => {
  const t = useTranslations('TrustManagement.Strategy');

  const [tabValue, setTabValue] = useState<number>(0);

  const handleTabChange = (
    _: SyntheticEvent<Element, Event>,
    index: number,
  ) => {
    setTabValue(index);
  };

  const tabs = [
    {
      key: 0,
      label: t('profitability'),
      component: <Profitability strategy={strategy} />,
    },
    {
      key: 1,
      label: t('about_the_strategy'),
      component: <About strategy={strategy} />,
    },
    {
      key: 2,
      label: t('instruments'),
      component: <Instruments strategy={strategy} />,
    },
    { key: 3, label: t('risks'), component: <Risks strategy={strategy} /> },
    {
      key: 4,
      label: t('questions_and_answers'),
      component: <FAQ strategy={strategy} />,
    },
  ];

  return (
    <>
      <Tabs
        value={tabValue}
        onChange={handleTabChange}
        variant="scrollable"
        sx={{ width: { xs: '100%', md: 'fit-content' }, mb: 7 }}
      >
        {tabs.map((tab) => (
          <Tab key={tab.key} label={tab.label} />
        ))}
      </Tabs>

      {tabs.map((tab) => (
        <TabPanel key={tab.key} value={tabValue} index={tab.key}>
          {tab.component}
        </TabPanel>
      ))}
    </>
  );
};
