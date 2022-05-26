import { FunctionComponent, useMemo } from 'react';
import { useSelector } from 'react-redux';

import { Panel } from '@waldur/core/Panel';
import { CustomerBookingManagement } from '@waldur/customer/dashboard/CustomerBookingManagement';
import { CategoryResourcesList } from '@waldur/dashboard/CategoryResourcesList';
import { isFeatureVisible } from '@waldur/features/connect';
import { translate } from '@waldur/i18n';
import { CustomerChecklistOverview } from '@waldur/marketplace-checklist/CustomerChecklistOverview';
import { CustomerResourcesFilter } from '@waldur/marketplace/resources/list/CustomerResourcesFilter';
import { useTitle } from '@waldur/navigation/title';
import {
  getUser,
  getCustomer,
  checkIsServiceManager,
} from '@waldur/workspace/selectors';
import { ORGANIZATION_WORKSPACE } from '@waldur/workspace/types';

import { useCustomerItems } from '../utils';

import { CustomerDashboardChart } from './CustomerDashboardChart';
import { CustomerResourcesList } from './CustomerResourcesList';

export const CustomerDashboard: FunctionComponent = () => {
  useTitle(translate('Dashboard'));
  useCustomerItems();

  const user = useSelector(getUser);
  const customer = useSelector(getCustomer);
  const isServiceManager = useMemo(
    () => checkIsServiceManager(customer, user),
    [customer, user],
  );

  return (
    <>
      {isServiceManager ? (
        <CustomerBookingManagement />
      ) : (
        <>
          <CustomerDashboardChart customer={customer} user={user} />
          <CustomerChecklistOverview customer={customer} />
          <CustomerBookingManagement />
          <Panel title={translate('Resources')}>
            <CustomerResourcesFilter />
            <CustomerResourcesList />
          </Panel>
          {isFeatureVisible('customer.category_resources_list') && (
            <CategoryResourcesList
              scopeType={ORGANIZATION_WORKSPACE}
              scope={customer}
            />
          )}
        </>
      )}
    </>
  );
};
