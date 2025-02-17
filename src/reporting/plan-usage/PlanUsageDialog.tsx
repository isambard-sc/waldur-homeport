import { EChartsOption } from 'echarts';
import { DateTime } from 'luxon';

import { EChart } from '@waldur/core/EChart';
import { translate } from '@waldur/i18n';
import { CloseDialogButton } from '@waldur/modal/CloseDialogButton';
import { ModalDialog } from '@waldur/modal/ModalDialog';

import { PlanUsageRowProps } from './types';

const getChartData = (props: PlanUsageRowProps): EChartsOption => ({
  toolbox: {
    show: true,
    showTitle: false,
    feature: {
      saveAsImage: {
        name: `${props.row.plan_name}-${DateTime.now().toISODate()}`,
      },
    },
  },
  series: [
    {
      type: 'pie',
      radius: ['50%', '70%'],
      label: {
        show: true,
        formatter: '{b}: {c}',
      },
      data: [
        {
          name: translate('Usage'),
          value: props.row.usage,
        },
        {
          name: translate('Remaining amount'),
          value: Math.max(0, props.row.limit - props.row.usage),
        },
      ],
    },
  ],
});

export const PlanUsageDialog = (props: { resolve: PlanUsageRowProps }) => (
  <ModalDialog
    title={translate('Plan capacity')}
    footer={<CloseDialogButton label={translate('Ok')} />}
  >
    <p>
      <strong>{translate('Provider')}</strong>:{' '}
      {props.resolve.row.customer_provider_name}
    </p>
    <p>
      <strong>{translate('Offering')}</strong>:{' '}
      {props.resolve.row.offering_name}
    </p>
    <p>
      <strong>{translate('Plan')}</strong>: {props.resolve.row.plan_name}
    </p>
    <EChart options={getChartData(props.resolve)} height="300px" />
  </ModalDialog>
);
