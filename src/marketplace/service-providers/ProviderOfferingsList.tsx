import { FC } from 'react';
import { useSelector } from 'react-redux';
import { getFormValues } from 'redux-form';
import { createSelector } from 'reselect';

import { useDestroyFilterOnLeave } from '@waldur/core/filters';
import { defaultCurrency } from '@waldur/core/formatCurrency';
import { translate } from '@waldur/i18n';
import { getLabel } from '@waldur/marketplace/common/registry';
import { createFetcher, Table } from '@waldur/table';
import { TableProps } from '@waldur/table/Table';
import { useTable } from '@waldur/table/utils';

import { useOfferingDropdownActions } from '../offerings/hooks';
import { CreateOfferingButton } from '../offerings/list/CreateOfferingButton';
import { OfferingActions } from '../offerings/list/OfferingActions';
import { OfferingsListTablePlaceholder } from '../offerings/list/OfferingsListTablePlaceholder';
import { OfferingStateCell } from '../offerings/list/OfferingStateCell';
import { CustomerResourcesListPlaceholder } from '../resources/list/CustomerResourcesListPlaceholder';
import { ServiceProvider } from '../types';

import { PROVIDER_OFFERINGS_FORM_ID } from './constants';
import { OfferingNameColumn } from './OfferingNameColumn';
import { ProviderOfferingsFilter } from './ProviderOfferingsFilter';
import { ResourcesCountColumn } from './ResourcesCountColumn';

interface ProviderOfferingsComponentProps {
  provider: ServiceProvider;
  extraTableProps?: Partial<TableProps>;
}

const mapPropsToFilter = createSelector(
  getFormValues(PROVIDER_OFFERINGS_FORM_ID),
  (filters: any) => {
    const result: Record<string, any> = {};
    if (filters?.state) {
      result.state = filters.state.map((option) => option.value);
    }
    if (filters?.offering_type) {
      result.type = filters.offering_type.value;
    }
    return result;
  },
);

export const ProviderOfferingsComponent: FC<ProviderOfferingsComponentProps> =
  ({ provider, extraTableProps = {} }) => {
    const filter = useSelector(mapPropsToFilter);

    const tableProps = useTable({
      table: 'ProviderOfferingsList',
      fetchData: createFetcher(
        `marketplace-service-providers/${provider.uuid}/offerings`,
      ),
      filter,
      queryField: 'name',
    });
    const dropdownActions = useOfferingDropdownActions();

    return (
      <Table
        {...tableProps}
        placeholderComponent={<OfferingsListTablePlaceholder />}
        columns={[
          {
            title: translate('Offering / Category'),
            render: OfferingNameColumn,
          },
          {
            title: translate('Type'),
            render: ({ row }) => getLabel(row.type),
          },
          {
            title: translate('Resources'),
            render: ResourcesCountColumn,
          },
          {
            title: translate('Estimated cost'),
            render: ({ row }) =>
              defaultCurrency(row.billing_price_estimate?.total || 0),
          },
          {
            title: translate('State'),
            render: OfferingStateCell,
          },
        ]}
        verboseName={translate('Offerings')}
        dropdownActions={dropdownActions}
        actions={<CreateOfferingButton fetch={tableProps.fetch} />}
        hoverableRow={(row) => (
          <OfferingActions row={row.row} refetch={tableProps.fetch} />
        )}
        {...extraTableProps}
        filters={<ProviderOfferingsFilter />}
        hasQuery={true}
      />
    );
  };

export const ProviderOfferingsList = ({ provider }) => {
  useDestroyFilterOnLeave(PROVIDER_OFFERINGS_FORM_ID);

  if (!provider) {
    return <CustomerResourcesListPlaceholder />;
  }
  return (
    <ProviderOfferingsComponent
      provider={provider}
      extraTableProps={{
        filters: <ProviderOfferingsFilter />,
      }}
    />
  );
};
