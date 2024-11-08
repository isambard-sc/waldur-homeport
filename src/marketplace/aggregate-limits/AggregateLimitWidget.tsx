import { Eye } from '@phosphor-icons/react';
import { useCallback } from 'react';
import { Col, Row } from 'react-bootstrap';
import { useDispatch } from 'react-redux';

import { lazyComponent } from '@waldur/core/lazyComponent';
import { LoadingSpinner } from '@waldur/core/LoadingSpinner';
import { WidgetCard } from '@waldur/dashboard/WidgetCard';
import { translate } from '@waldur/i18n';
import { AggregateLimitsShowMoreButton } from '@waldur/marketplace/aggregate-limits/AggregateLimitsShowMoreButton';
import { QuotaCell } from '@waldur/marketplace/resources/details/QuotaCell';
import { openModalDialog } from '@waldur/modal/actions';
import { Customer, Project } from '@waldur/workspace/types';

interface AggregateLimitWidgetProps {
  project?: Project;
  customer?: Customer;
  data: any;
  isLoading: boolean;
  error: any;
}

const AggregateLimitDetailsDialog = lazyComponent(
  () => import('./AggregateLimitDetailsDialog'),
  'AggregateLimitDetailsDialog',
);

export const ComponentItem = ({ component }) => {
  return (
    <QuotaCell
      usage={component.usage}
      limit={component.limit}
      title={component.name}
      description={component.description}
    />
  );
};

export const AggregateLimitWidget = ({
  project,
  customer,
  data,
  isLoading,
  error,
}: AggregateLimitWidgetProps) => {
  const dispatch = useDispatch();
  const isProject = !!project;

  const viewDetails = useCallback(
    () =>
      dispatch(
        openModalDialog(AggregateLimitDetailsDialog, {
          resolve: {
            [isProject ? 'project' : 'customer']: isProject
              ? project
              : customer,
            components: data?.data.components,
          },
          size: 'lg',
        }),
      ),
    [dispatch, project, customer, data, isProject],
  );

  if (isLoading) {
    return <LoadingSpinner />;
  } else if (error) {
    return (
      <>
        {translate(
          `Unable to load aggregate limits for this ${isProject ? 'project' : 'customer'}`,
        )}
      </>
    );
  }

  const components = data.data.components;

  return components?.length ? (
    <WidgetCard
      cardTitle={translate('Aggregate usage and limits')}
      className="h-100"
      actions={[
        {
          label: translate('Details'),
          icon: <Eye />,
          callback: viewDetails,
        },
      ]}
    >
      <Row className="field-row">
        {components.slice(0, 4).map((component) => (
          <Col key={component.type} xs={6}>
            <ComponentItem component={component} />
          </Col>
        ))}
      </Row>
      {components?.length > 4 && (
        <div className="flex-grow-1 d-flex align-items-end">
          <AggregateLimitsShowMoreButton components={components} />
        </div>
      )}
    </WidgetCard>
  ) : null;
};
