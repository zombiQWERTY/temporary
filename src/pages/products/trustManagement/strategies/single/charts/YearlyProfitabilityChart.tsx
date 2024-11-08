import { BarChart } from '@mui/x-charts';
import { isAfter, parseISO, subYears } from 'date-fns';
import { useMemo } from 'react';

import { GetStrategyByIdApi } from '@/entities/TrustManagements';

const yearlyData = [
  { year: '1928', value: 37.88 },
  { year: '1929', value: -11.91 },
  { year: '1930', value: -28.48 },
  { year: '1931', value: -47.07 },
  { year: '1932', value: -15.15 },
  { year: '1933', value: 46.59 },
  { year: '1934', value: -5.94 },
  { year: '1935', value: 41.37 },
  { year: '1936', value: 27.92 },
  { year: '1937', value: -38.59 },
  { year: '1938', value: 25.21 },
  { year: '1939', value: -5.45 },
  { year: '1940', value: -15.29 },
  { year: '1941', value: -17.86 },
  { year: '1942', value: 12.43 },
  { year: '1943', value: 19.45 },
  { year: '1944', value: 13.8 },
  { year: '1945', value: 30.72 },
  { year: '1946', value: -11.87 },
  { year: '1947', value: 0 },
  { year: '1948', value: -0.65 },
  { year: '1949', value: 10.26 },
  { year: '1950', value: 21.78 },
  { year: '1951', value: 16.46 },
  { year: '1952', value: 11.78 },
  { year: '1953', value: -6.62 },
  { year: '1954', value: 45.02 },
  { year: '1955', value: 26.4 },
  { year: '1956', value: 2.62 },
  { year: '1957', value: -14.31 },
  { year: '1958', value: 38.06 },
  { year: '1959', value: 8.48 },
  { year: '1960', value: -2.97 },
  { year: '1961', value: 23.13 },
  { year: '1962', value: -11.81 },
  { year: '1963', value: 18.89 },
  { year: '1964', value: 12.97 },
  { year: '1965', value: 9.06 },
  { year: '1966', value: -13.09 },
  { year: '1967', value: 20.09 },
  { year: '1968', value: 7.66 },
  { year: '1969', value: -11.36 },
  { year: '1970', value: 0.1 },
  { year: '1971', value: 10.79 },
  { year: '1972', value: 15.63 },
  { year: '1973', value: -17.37 },
  { year: '1974', value: -29.72 },
  { year: '1975', value: 31.55 },
  { year: '1976', value: 19.15 },
  { year: '1977', value: -11.5 },
  { year: '1978', value: 1.06 },
  { year: '1979', value: 12.31 },
  { year: '1980', value: 25.77 },
  { year: '1981', value: -9.73 },
  { year: '1982', value: 14.76 },
  { year: '1983', value: 17.27 },
  { year: '1984', value: 1.4 },
  { year: '1985', value: 26.33 },
  { year: '1986', value: 14.62 },
  { year: '1987', value: 2.03 },
  { year: '1988', value: 12.4 },
  { year: '1989', value: 27.25 },
  { year: '1990', value: -6.56 },
  { year: '1991', value: 26.31 },
  { year: '1992', value: 4.46 },
  { year: '1993', value: 7.06 },
  { year: '1994', value: -1.54 },
  { year: '1995', value: 34.11 },
  { year: '1996', value: 20.26 },
  { year: '1997', value: 31.01 },
  { year: '1998', value: 26.67 },
  { year: '1999', value: 19.53 },
  { year: '2000', value: -10.14 },
  { year: '2001', value: -13.04 },
  { year: '2002', value: -23.37 },
  { year: '2003', value: 26.38 },
  { year: '2004', value: 8.99 },
  { year: '2005', value: 3 },
  { year: '2006', value: 13.62 },
  { year: '2007', value: 3.53 },
  { year: '2008', value: -38.49 },
  { year: '2009', value: 23.45 },
  { year: '2010', value: 12.78 },
  { year: '2011', value: 0 },
  { year: '2012', value: 13.41 },
  { year: '2013', value: 29.6 },
  { year: '2014', value: 11.39 },
  { year: '2015', value: -0.73 },
  { year: '2016', value: 9.54 },
  { year: '2017', value: 19.42 },
  { year: '2018', value: -6.24 },
  { year: '2019', value: 28.88 },
  { year: '2020', value: 16.26 },
  { year: '2021', value: 26.89 },
  { year: '2022', value: -19.44 },
  { year: '2023', value: 24.23 },
  { year: '2024', value: 17.95 },
];

const getFilteredData = (startDate: Date, data: Record<string, any>[]) => {
  const today = new Date();

  const twoYearsAgo = subYears(today, 2);

  const effectiveStartDate = isAfter(startDate, twoYearsAgo)
    ? twoYearsAgo
    : startDate;

  return data.filter((d) => {
    const dataDate = parseISO(d.year + '-01-01');
    return (
      isAfter(dataDate, effectiveStartDate) ||
      dataDate.getTime() === effectiveStartDate.getTime()
    );
  });
};

interface YearlyProfitabilityChartProps {
  strategy: GetStrategyByIdApi.StrategySchema;
}

// @FIXME: Тестовый график. Вообще хз, что тут происходит
export const YearlyProfitabilityChart = ({
  strategy,
}: YearlyProfitabilityChartProps) => {
  const data = useMemo(
    () => getFilteredData(new Date(strategy.strategyStartDate), yearlyData),
    [strategy.strategyStartDate],
  );

  const strategyData = useMemo(() => {
    const d = strategy.annualReturn.map((r) => r.return);

    const dataLength = data.length;
    const strategyDataLength = d.length;

    if (strategyDataLength < dataLength) {
      const difference = dataLength - strategyDataLength;
      const zerosArray: number[] = Array(difference).fill(0);
      return [...zerosArray, ...d];
    }

    return d;
  }, [data.length, strategy.annualReturn]);

  if (!data.length) {
    return 'N/A';
  }

  return (
    <BarChart
      height={400}
      dataset={data}
      xAxis={[{ scaleType: 'band', dataKey: 'year' }]}
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
