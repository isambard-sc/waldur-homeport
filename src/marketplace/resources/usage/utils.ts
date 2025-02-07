import { DateTime } from 'luxon';

import { parseDate } from '@waldur/core/dateUtils';
import { translate } from '@waldur/i18n';
import { getAccountingTypeOptions } from '@waldur/marketplace/offerings/update/components/ComponentAccountingTypeField';
import { OfferingComponent } from '@waldur/marketplace/types';

import { ComponentUsage, ComponentUserUsage } from './types';

interface RowData {
  value: number;
  description: string;
  details?: Array<any>;
}

const formatChart = (
  name: string,
  color: string,
  labels: string[],
  usages: RowData[],
  serieName: string = undefined,
) => ({
  toolbox: {
    feature: {
      saveAsImage: {
        title: translate('Save'),
        name: `components-usage-chart-${DateTime.now().toISODate()}`,
        show: true,
      },
      dataView: {
        title: translate('View data'),
        show: true,
        lang: [
          translate('Data view'),
          translate('Turn off'),
          translate('Refresh'),
        ],
        readOnly: true,
      },
    },
  },
  tooltip: {
    trigger: 'axis',
    axisPointer: {
      type: 'cross',
      crossStyle: {
        color: '#999',
      },
    },
    formatter: (params) => {
      const date = params[0].axisValue;
      const value = params[0].data.value;
      const description = params[0].data.description;
      const details: RowData['details'] = params[0].data.details;
      if (!value) {
        return null;
      }
      let tooltip =
        `${translate('Date')}: ${date}` +
        `<br/>${translate('Value')}: ${value}` +
        `${
          description ? `<br/>${translate('Description')}: ${description}` : ''
        }`;
      if (details?.length) {
        tooltip += `<br/><b>${translate('Details')}:</b>`;
        details.forEach((d) => {
          tooltip += `<br/>${d.username} - ${d.usage} ${d.measured_unit}`;
        });
      }
      return `<span>${tooltip}</span>`;
    },
  },
  xAxis: [
    {
      type: 'category',
      data: labels,
      axisPointer: {
        type: 'shadow',
      },
    },
  ],
  yAxis: [
    {
      type: 'value',
      name,
      axisLabel: {
        formatter: '{value}',
      },
      axisLine: { show: true },
      axisTick: { show: true },
    },
  ],
  series: [
    {
      type: 'bar',
      name: serieName,
      data: usages,
      color,
    },
  ],
});

const getMonthsPeriods = (months): DateTime[] => {
  const periods = [];
  for (let i = months - 1; i >= 0; i--) {
    periods.push(DateTime.now().minus({ months: i }));
  }
  return periods;
};

export const getFormattedUsages = (
  periods: DateTime[],
  usages: ComponentUsage[],
  userUsages: ComponentUserUsage[] = [],
): RowData[] => {
  return periods.map((period) => {
    const matchingUsage = usages.find(
      (usage) =>
        parseDate(usage.billing_period).toFormat('yyyy-MM') ===
        period.toFormat('yyyy-MM'),
    );

    if (matchingUsage) {
      const details = userUsages.filter(
        (u) =>
          parseDate(u.date).toFormat('yyyy-MM') === period.toFormat('yyyy-MM'),
      );

      return {
        value: matchingUsage.usage,
        description: matchingUsage.description,
        details,
      };
    }

    return {
      value: 0,
      description: '',
      details: [],
    };
  });
};

export const getUsagePeriods = (usages: ComponentUsage[], months: number) => {
  let numberOfMonths = months;
  if (!numberOfMonths) {
    // Calculate number of months from usages, if months param is not given
    const startDateUnix = Math.min(
      ...usages.map((usage) => new Date(usage.date).getTime()),
    );
    const _months = parseDate(startDateUnix)
      .startOf('month')
      .diffNow()
      .as('months');
    numberOfMonths = Math.ceil(Math.abs(_months));
  }
  const periods = getMonthsPeriods(numberOfMonths);
  const labels = periods.map((date) => `${date.month} - ${date.year}`);
  return { periods, labels };
};

export const getEChartOptions = (
  component: OfferingComponent,
  usages: ComponentUsage[],
  userUsages: ComponentUserUsage[],
  months: number,
  color: string,
) => {
  const { labels, periods } = getUsagePeriods(usages, months);
  const formattedUsages = getFormattedUsages(
    periods,
    usages.filter((usage) => usage.type === component.type),
    userUsages?.filter((usage) => usage.component_type === component.type),
  );
  return formatChart(
    component.measured_unit,
    color,
    labels,
    formattedUsages,
    component.name,
  );
};

export const getUsageHistoryPeriodOptions = (startDate = null) => {
  const now = DateTime.now();
  const start = parseDate(startDate);
  let totalMonths = Math.max(
    0,
    (now.year - start.year) * 12 + (now.month - start.month),
  );
  if (now.day >= start.day || totalMonths > 0) {
    totalMonths += 1;
  }
  const options: Array<{ value; label }> = [];
  if (totalMonths > 6) {
    options.push({
      value: 6,
      label: translate('{month} months', { month: 6 }),
    });
  }
  if (totalMonths > 12) {
    options.push({
      value: 12,
      label: translate('{month} months', { month: 12 }),
    });
  }
  options.push({ value: totalMonths, label: translate('From creation') });
  return options;
};

export const getBillingTypeLabel = (value) =>
  getAccountingTypeOptions().find((option) => option.value === value)?.label ||
  'N/A';

export const getTableData = (
  component: OfferingComponent,
  usages: ComponentUsage[],
) => {
  return usages
    .filter((usage) => usage.type === component.type)
    .map((usage) => {
      return {
        date: parseDate(usage.date).toFormat('MM/yyyy'),
        usage: Number(usage.usage),
      };
    });
};
