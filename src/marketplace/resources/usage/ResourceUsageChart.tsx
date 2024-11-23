import { FunctionComponent, useMemo } from 'react';

import { EChart } from '@waldur/core/EChart';
import { translate } from '@waldur/i18n';
import { getEChartOptions } from '@waldur/marketplace/resources/usage/utils';
import { OfferingComponent } from '@waldur/marketplace/types';

import { ComponentUsage, ComponentUserUsage } from './types';

interface ResourceUsageChartProps {
  resource?: { name };
  offeringComponent: OfferingComponent;
  usages: ComponentUsage[];
  userUsages?: ComponentUserUsage[];
  months: number;
  chartColor: string;
  hasExport?: boolean;
}

export const ResourceUsageChart: FunctionComponent<ResourceUsageChartProps> = ({
  resource,
  offeringComponent,
  usages,
  userUsages,
  months,
  chartColor,
  hasExport,
}) => {
  const options = useMemo(
    () =>
      getEChartOptions(
        offeringComponent,
        usages,
        userUsages,
        months,
        chartColor,
      ),
    [offeringComponent, usages, userUsages, chartColor],
  );

  return (
    <EChart
      options={options}
      height="400px"
      exportPdf={hasExport}
      exportCsv={hasExport}
      exportExcel={hasExport}
      exportTitle={
        hasExport
          ? translate('Usage history') +
            ` - ${resource?.name} - ${offeringComponent.name}`
          : undefined
      }
    />
  );
};
