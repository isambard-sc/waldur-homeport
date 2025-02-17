import { useSelector } from 'react-redux';
import { getFormValues } from 'redux-form';
import { createSelector } from 'reselect';

import { translate } from '@waldur/i18n';
import { createFetcher } from '@waldur/table/api';
import Table from '@waldur/table/Table';
import { useTable } from '@waldur/table/useTable';

import { CustomerQuotasFilter } from './CustomerQuotasFilter';
import { CustomerQuota, QuotaChoice } from './types';

const filterSelector = createSelector(
  getFormValues('CustomerQuotasFilter'),
  (filters: { quota: { key } }) => ({ quota_name: filters?.quota.key }),
);

export const CustomerQuotasList = () => {
  const filter = useSelector(filterSelector);
  const tableProps = useTable({
    table: 'CustomerQuotasList',
    fetchData: createFetcher('customer-quotas'),
    filter,
  });
  const formValues = useSelector<any, { quota: QuotaChoice }>(
    getFormValues('CustomerQuotasFilter') as any,
  );

  return (
    <Table<CustomerQuota>
      {...tableProps}
      columns={[
        {
          title: translate('Name'),
          render: ({ row }) => <>{row.customer_name}</>,
          copyField: (row) => row.customer_name,
          orderField: 'name',
        },
        {
          title: translate('Abbreviation'),
          render: ({ row }) => <>{row.customer_abbreviation}</>,
        },
        {
          title: translate('Value'),
          render: ({ row }) => (
            <>
              {formValues.quota.tooltipValueFormatter
                ? formValues.quota.tooltipValueFormatter(row.value)
                : row.value}
            </>
          ),
          orderField: 'value',
        },
      ]}
      showPageSizeSelector={true}
      filters={<CustomerQuotasFilter />}
      hideClearFilters
    />
  );
};
