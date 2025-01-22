import { FunctionComponent } from 'react';
import { Field, reduxForm } from 'redux-form';

import { AccountingRunningField } from '@waldur/customer/list/AccountingRunningField';
import { SelectOrganizationGroupFieldPure } from '@waldur/customer/list/SelectOrganizationGroupField';
import { ServiceProviderFilter } from '@waldur/customer/list/ServiceProviderFilter';
import { isFeatureVisible } from '@waldur/features/connect';
import { MarketplaceFeatures } from '@waldur/FeaturesEnums';
import { AwesomeCheckboxField } from '@waldur/form/AwesomeCheckboxField';
import { REACT_SELECT_TABLE_FILTER } from '@waldur/form/themed-select';
import { translate } from '@waldur/i18n';
import { TableFilterItem } from '@waldur/table/TableFilterItem';
import { CUSTOMERS_FILTER_FORM_ID } from '@waldur/user/constants';

const PureSupportCustomerFilter: FunctionComponent = () => (
  <>
    <TableFilterItem
      title={translate('Accounting running')}
      name="accounting_is_running"
      badgeValue={(value) => value?.label}
    >
      <AccountingRunningField reactSelectProps={REACT_SELECT_TABLE_FILTER} />
    </TableFilterItem>
    <TableFilterItem
      title={translate('Service provider')}
      name="is_service_provider"
      badgeValue={(value) => value?.label}
    >
      <ServiceProviderFilter />
    </TableFilterItem>
    {isFeatureVisible(
      MarketplaceFeatures.show_call_management_functionality,
    ) && (
      <TableFilterItem
        title={translate('Call managing organization')}
        name="is_call_managing_organization"
        badgeValue={(value) => (value ? translate('Yes') : translate('All'))}
        ellipsis={false}
      >
        <Field
          name="is_call_managing_organization"
          component={AwesomeCheckboxField}
          label={translate('Show only call managing organizations')}
          parse={(v) => v || undefined}
        />
      </TableFilterItem>
    )}
    <TableFilterItem
      title={translate('Organization group')}
      name="organization_group"
      badgeValue={(value) => value?.name}
    >
      <SelectOrganizationGroupFieldPure
        reactSelectProps={REACT_SELECT_TABLE_FILTER}
      />
    </TableFilterItem>
  </>
);

export const OrganizationsFilter = reduxForm<{}, any>({
  form: CUSTOMERS_FILTER_FORM_ID,
  destroyOnUnmount: false,
})(PureSupportCustomerFilter);
