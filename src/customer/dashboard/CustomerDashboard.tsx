import { useQuery } from '@tanstack/react-query';
import { FunctionComponent, useMemo } from 'react';
import { Col, Row } from 'react-bootstrap';
import { useSelector } from 'react-redux';

import { COMMON_WIDGET_HEIGHT } from '@waldur/dashboard/constants';
import { AggregateLimitWidget } from '@waldur/marketplace/aggregate-limits/AggregateLimitWidget';
import { getCustomerStats } from '@waldur/marketplace/aggregate-limits/api';
import { ProjectsList } from '@waldur/project/ProjectsList';
import {
  checkIsServiceManager,
  getCustomer,
  getUser,
  isOwnerOrStaff,
} from '@waldur/workspace/selectors';

import { CreditStatusWidget } from './CreditStatusWidget';
import { CustomerDashboardChart } from './CustomerDashboardChart';
import { CustomerProfile } from './CustomerProfile';

export const CustomerDashboard: FunctionComponent = () => {
  const user = useSelector(getUser);
  const customer = useSelector(getCustomer);
  const isServiceManager = useMemo(
    () => checkIsServiceManager(customer, user),
    [customer, user],
  );
  const canSeeCharts = useSelector(isOwnerOrStaff);

  const {
    data: aggregateLimitData,
    isLoading: isAggregateLimitLoading,
    error: aggregateLimitError,
  } = useQuery(
    ['customer-stats', customer?.uuid],
    () => getCustomerStats(customer?.uuid),
    { refetchOnWindowFocus: false, staleTime: 60 * 1000 },
  );

  const shouldShowAggregateLimitWidget =
    aggregateLimitData?.data.components?.length > 0;

  if (!customer) return null;

  return (
    <>
      {isServiceManager ? (
        <CustomerProfile customer={customer} />
      ) : (
        <>
          {canSeeCharts && (
            <CustomerDashboardChart customer={customer} user={user} />
          )}
          {(shouldShowAggregateLimitWidget || Boolean(customer.credit)) && (
            <Row>
              <Col md={6} sm={12} className="mb-5" style={COMMON_WIDGET_HEIGHT}>
                <AggregateLimitWidget
                  customer={customer}
                  data={aggregateLimitData}
                  isLoading={isAggregateLimitLoading}
                  error={aggregateLimitError}
                />
              </Col>
              {Boolean(customer.credit) && (
                <Col
                  md={6}
                  sm={12}
                  className="mb-5"
                  style={COMMON_WIDGET_HEIGHT}
                >
                  <CreditStatusWidget
                    credit={customer.credit}
                    type="organization"
                  />
                </Col>
              )}
            </Row>
          )}
          <ProjectsList />
        </>
      )}
    </>
  );
};
