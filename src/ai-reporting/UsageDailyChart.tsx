import { EChartsOption } from 'echarts';
import { DateTime } from 'luxon';
import { FC, useCallback, useMemo } from 'react';

import { ChartCard } from '@/core/ChartCard';
import { EChart } from '@/core/EChart';
import { getCategoricalColors } from '@/dashboard/chartColors';
import { translate } from '@/i18n';

import { DailyUsage } from './usageStatsApi';

interface UsageDailyChartProps {
  daily: DailyUsage[];
}

export const UsageDailyChart: FC<UsageDailyChartProps> = ({ daily }) => {
  const chartOptions = useMemo((): EChartsOption => {
    const dates = daily.map((d) => DateTime.fromISO(d.date).toFormat('MMM dd'));
    const inputTokens = daily.map((d) => d.input_tokens);
    const outputTokens = daily.map((d) => d.output_tokens);
    const [inputColor, outputColor] = getCategoricalColors();

    return {
      tooltip: { trigger: 'axis' },
      legend: { data: [translate('Input tokens'), translate('Output tokens')] },
      grid: { left: '3%', right: '4%', bottom: '3%', containLabel: true },
      xAxis: {
        type: 'category',
        data: dates,
        axisLabel: { rotate: 45 },
      },
      yAxis: { type: 'value', name: translate('Tokens') },
      series: [
        {
          name: translate('Input tokens'),
          type: 'bar',
          stack: 'tokens',
          data: inputTokens,
          itemStyle: { color: inputColor },
        },
        {
          name: translate('Output tokens'),
          type: 'bar',
          stack: 'tokens',
          data: outputTokens,
          itemStyle: { color: outputColor },
        },
      ],
    };
  }, [daily]);

  const getExportData = useCallback(
    () => ({
      fields: [
        translate('Date'),
        translate('Input tokens'),
        translate('Output tokens'),
        translate('Requests'),
      ],
      data: daily.map((d) => [
        DateTime.fromISO(d.date).toFormat('MMM dd, yyyy'),
        d.input_tokens,
        d.output_tokens,
        d.requests,
      ]),
    }),
    [daily],
  );

  return (
    <ChartCard
      title={translate('Daily token usage')}
      getExportData={getExportData}
      isEmpty={daily.every(
        (d) => d.input_tokens === 0 && d.output_tokens === 0,
      )}
    >
      {(ref) => <EChart ref={ref} options={chartOptions} height="300px" />}
    </ChartCard>
  );
};
