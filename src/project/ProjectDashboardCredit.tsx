import { Col } from 'react-bootstrap';
import { Project } from 'waldur-js-client';

import { EChart } from '@waldur/core/EChart';
import { defaultCurrency } from '@waldur/core/formatCurrency';
import { LoadingErred } from '@waldur/core/LoadingErred';
import { LoadingSpinner } from '@waldur/core/LoadingSpinner';
import { COMMON_WIDGET_HEIGHT } from '@waldur/dashboard/constants';
import { WidgetCard } from '@waldur/dashboard/WidgetCard';
import { translate } from '@waldur/i18n';

import { useProjectCreditChart } from './utils';

export const ProjectDashboardCredit = ({
  project,
  className,
}: {
  project: Project;
  className?: string;
}) => {
  const { credit, chart, options, error, isLoading, refetch } =
    useProjectCreditChart(project);

  if (isLoading) {
    return <LoadingSpinner />;
  } else if (error) {
    return (
      <LoadingErred
        message={translate('Unable to load data.')}
        loadData={refetch}
      />
    );
  }
  if (!credit) {
    return null;
  }
  return (
    <Col md={6} sm={12} className={className} style={COMMON_WIDGET_HEIGHT}>
      <WidgetCard
        cardTitle={
          <>
            {chart.title}
            <small className="text-muted fs-7 ms-4 fw-normal">
              ({translate('Current balance')}: {defaultCurrency(credit.value)})
            </small>
          </>
        }
        className="h-100"
      >
        <EChart options={options} />
      </WidgetCard>
    </Col>
  );
};
