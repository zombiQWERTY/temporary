import { LineChart } from '@mui/x-charts';
import { parseISO, isAfter, subMonths } from 'date-fns';
import { useMemo } from 'react';

import { GetStrategyByIdApi } from '@/entities/TrustManagements';

const monthlyData = [
  {
    month: '2019-08',
    value: -1.8092,
  },
  {
    month: '2019-09',
    value: 1.7181,
  },
  {
    month: '2019-10',
    value: 2.0434,
  },
  {
    month: '2019-11',
    value: 3.4046,
  },
  {
    month: '2019-12',
    value: 2.859,
  },
  {
    month: '2020-01',
    value: -0.163,
  },
  {
    month: '2020-02',
    value: -8.4108,
  },
  {
    month: '2020-03',
    value: -12.512,
  },
  {
    month: '2020-04',
    value: 12.6844,
  },
  {
    month: '2020-05',
    value: 4.528,
  },
  {
    month: '2020-06',
    value: 1.8388,
  },
  {
    month: '2020-07',
    value: 5.5104,
  },
  {
    month: '2020-08',
    value: 7.0063,
  },
  {
    month: '2020-09',
    value: -3.9228,
  },
  {
    month: '2020-10',
    value: -2.7666,
  },
  {
    month: '2020-11',
    value: 10.7547,
  },
  {
    month: '2020-12',
    value: 3.7121,
  },
  {
    month: '2021-01',
    value: -1.1136,
  },
  {
    month: '2021-02',
    value: 2.6091,
  },
  {
    month: '2021-03',
    value: 4.2439,
  },
  {
    month: '2021-04',
    value: 5.2426,
  },
  {
    month: '2021-05',
    value: 0.5485,
  },
  {
    month: '2021-06',
    value: 2.2213,
  },
  {
    month: '2021-07',
    value: 2.275,
  },
  {
    month: '2021-08',
    value: 2.8989,
  },
  {
    month: '2021-09',
    value: -4.7569,
  },
  {
    month: '2021-10',
    value: 6.9143,
  },
  {
    month: '2021-11',
    value: -0.8333,
  },
  {
    month: '2021-12',
    value: 4.3613,
  },
  {
    month: '2022-01',
    value: -5.2586,
  },
  {
    month: '2022-02',
    value: -3.136,
  },
  {
    month: '2022-03',
    value: 3.5774,
  },
  {
    month: '2022-04',
    value: -8.7958,
  },
  {
    month: '2022-05',
    value: 0.0054,
  },
  {
    month: '2022-06',
    value: -8.39,
  },
  {
    month: '2022-07',
    value: 9.1114,
  },
  {
    month: '2022-08',
    value: -4.2439,
  },
  {
    month: '2022-09',
    value: -9.3394,
  },
  {
    month: '2022-10',
    value: 7.9861,
  },
  {
    month: '2022-11',
    value: 5.3753,
  },
  {
    month: '2022-12',
    value: -5.8971,
  },
  {
    month: '2023-01',
    value: 6.1755,
  },
  {
    month: '2023-02',
    value: -2.6113,
  },
  {
    month: '2023-03',
    value: 3.5051,
  },
  {
    month: '2023-04',
    value: 1.4642,
  },
  {
    month: '2023-05',
    value: 0.2481,
  },
  {
    month: '2023-06',
    value: 6.4729,
  },
  {
    month: '2023-07',
    value: 3.1139,
  },
  {
    month: '2023-08',
    value: -1.7716,
  },
  {
    month: '2023-09',
    value: -4.8719,
  },
  {
    month: '2023-10',
    value: -2.198,
  },
  {
    month: '2023-11',
    value: 8.9179,
  },
  {
    month: '2023-12',
    value: 4.4229,
  },
  {
    month: '2024-01',
    value: 1.5895,
  },
  {
    month: '2024-02',
    value: 5.1721,
  },
  {
    month: '2024-03',
    value: 3.102,
  },
  {
    month: '2024-04',
    value: -4.1616,
  },
  {
    month: '2024-05',
    value: 4.802,
  },
  {
    month: '2024-06',
    value: 3.4671,
  },
  {
    month: '2024-07',
    value: 1.1321,
  },
  {
    month: '2024-08',
    value: 0.231,
  },
];

const getFilteredData = (startDate: Date, data: Record<string, any>[]) => {
  const today = new Date();

  const twoMonthsAgo = subMonths(today, 2);

  const effectiveStartDate = isAfter(startDate, twoMonthsAgo)
    ? twoMonthsAgo
    : startDate;

  return data.filter((d) => {
    const dataDate = parseISO(d.month + '-01');
    return (
      isAfter(dataDate, effectiveStartDate) ||
      dataDate.getTime() === effectiveStartDate.getTime()
    );
  });
};

interface MonthlyProfitabilityChartProps {
  strategy: GetStrategyByIdApi.StrategySchema;
}

// @FIXME: Тестовый график. Вообще хз, что тут происходит
export const MonthlyProfitabilityChart = ({
  strategy,
}: MonthlyProfitabilityChartProps) => {
  const data = useMemo(
    () => getFilteredData(new Date(strategy.strategyStartDate), monthlyData),
    [strategy.strategyStartDate],
  );

  const strategyData = useMemo(() => {
    const d = strategy.monthlyReturn.map((r) => r.return);

    const dataLength = data.length;
    const strategyDataLength = d.length;

    if (strategyDataLength < dataLength) {
      const difference = dataLength - strategyDataLength;
      const zerosArray: number[] = Array(difference).fill(0);
      return [...zerosArray, ...d];
    }

    return d;
  }, [data.length, strategy.monthlyReturn]);

  if (!data.length) {
    return 'N/A';
  }

  return (
    <LineChart
      height={400}
      dataset={data}
      xAxis={[{ scaleType: 'band', dataKey: 'month' }]}
      yAxis={[
        { scaleType: 'linear', valueFormatter: (v) => v?.toFixed(2) + '%' },
      ]}
      series={[
        {
          label: strategy?.profiles?.[0]?.strategyName || 'N/A',
          data: strategyData,
          color: '#526ED3',
        },
        {
          label: 'S&P 500',
          dataKey: 'value',
          color: '#A6ABB0',
        },
      ]}
    />
  );
};
