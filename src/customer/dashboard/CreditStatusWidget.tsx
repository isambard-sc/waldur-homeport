import { Circle, WarningOctagon } from '@phosphor-icons/react';
import { FC } from 'react';
import { Col, Stack } from 'react-bootstrap';

import { ENV } from '@waldur/configs/default';
import { Badge } from '@waldur/core/Badge';
import { formatDate } from '@waldur/core/dateUtils';
import { defaultCurrency } from '@waldur/core/formatCurrency';
import { LoadingErred } from '@waldur/core/LoadingErred';
import { LoadingSpinner } from '@waldur/core/LoadingSpinner';
import { RingChart } from '@waldur/dashboard/RingChart';
import { WidgetCard } from '@waldur/dashboard/WidgetCard';
import { formatJsxTemplate, translate } from '@waldur/i18n';
import { ChangesAmountBadge } from '@waldur/marketplace/service-providers/dashboard/ChangesAmountBadge';
import { DASH_ESCAPE_CODE } from '@waldur/table/constants';
import { Project } from '@waldur/workspace/types';

import { CustomerCredit, ProjectCredit } from '../credits/types';

interface CreditStatusWidgetProps {
  credit: Partial<CustomerCredit & ProjectCredit>;
  type: 'organization' | 'project';
  project?: Project;
  isLoading?;
  error?;
  refetch?;
}

const ChartLegend = ({ label, className = '' }) => (
  <Col xs="auto" className={className}>
    <Stack direction="horizontal" gap={2} className="align-items-center">
      <Circle size={10} weight="fill" className="text-primary-100" />
      {translate('Total')}
    </Stack>
    <Stack direction="horizontal" gap={2} className="align-items-center">
      <Circle size={10} weight="fill" className="text-primary" />
      {label}
    </Stack>
  </Col>
);

export const CreditStatusWidget: FC<CreditStatusWidgetProps> = ({
  credit,
  type,
  project,
  isLoading,
  error,
  refetch,
}) => {
  const consumption =
    type === 'organization'
      ? credit?.allocated_to_projects
      : Number(project?.billing_price_estimate?.total);

  if (isLoading) {
    return <LoadingSpinner />;
  } else if (error) {
    return <LoadingErred loadData={refetch} />;
  }

  return (
    <WidgetCard
      cardTitle={translate('Credits')}
      title={
        <div className="d-flex flex-wrap gap-3">
          {defaultCurrency(credit?.value)}
          {type === 'organization' &&
            credit.allocated_to_projects > Number(credit.value) && (
              <Badge
                leftIcon={<WarningOctagon />}
                variant="warning"
                outline
                pill
              >
                {translate('Credit is overallocated')}
              </Badge>
            )}
        </div>
      }
      className="h-100"
      meta={
        type === 'organization' ? (
          <>
            <div>
              {translate(
                '{amount} spent last month',
                {
                  amount: (
                    <ChangesAmountBadge
                      changes={credit.consumption_last_month}
                      showOnInfinity
                      showOnZero
                      asBadge={false}
                      unit={' ' + ENV.plugins.WALDUR_CORE.CURRENCY_NAME}
                    />
                  ),
                },
                formatJsxTemplate,
              )}
            </div>
            <div>
              {translate('End date')}:{' '}
              {credit.end_date ? formatDate(credit.end_date) : DASH_ESCAPE_CODE}
            </div>
          </>
        ) : (
          <ChartLegend
            label={translate('Estimate for the current month')}
            className="text-gray-700 mb-2"
          />
        )
      }
      left={
        <RingChart
          option={{
            title:
              type === 'organization'
                ? translate('Allocated\nto projects')
                : translate('Estimate for the\ncurrent month'),
            label: defaultCurrency(consumption),
            value: consumption,
            max: Number(credit?.value),
          }}
          className="me-3"
          height="116px"
          width="116px"
        />
      }
      right={
        type === 'organization' && (
          <ChartLegend
            label={translate('Allocated')}
            className="text-gray-700 mb-2"
          />
        )
      }
    />
  );
};
