import { FC } from 'react';

import { Link } from '@waldur/core/Link';
import { COMMON_CREDIT_COLUMNS } from '@waldur/customer/credits/constants';
import { CreateCreditButton } from '@waldur/customer/credits/CreateCreditButton';
import { CreditActions } from '@waldur/customer/credits/CreditActions';
import { CreditHistoryLogButton } from '@waldur/customer/credits/CreditHistoryLogButton';
import { CustomerCredit } from '@waldur/customer/credits/types';
import { translate } from '@waldur/i18n';
import { createFetcher } from '@waldur/table/api';
import Table from '@waldur/table/Table';
import { useTable } from '@waldur/table/useTable';

const OrganizationField = ({ row }) => (
  <Link
    state="organization.dashboard"
    params={{ uuid: row.customer_uuid }}
    label={row.customer_name}
  />
);

export const OrganizationCreditsList: FC<{}> = () => {
  const tableProps = useTable({
    table: 'OrganizationCreditsList',
    fetchData: createFetcher('customer-credits'),
    queryField: 'query',
  });

  return (
    <Table<CustomerCredit>
      {...tableProps}
      columns={[
        {
          title: translate('Organization name'),
          render: OrganizationField,
          export: 'customer_name',
        },
        ...COMMON_CREDIT_COLUMNS,
      ]}
      title={translate('Credit management')}
      verboseName={translate('Credits')}
      hasQuery
      enableExport
      rowActions={CreditActions}
      tableActions={
        <>
          <CreditHistoryLogButton />
          <CreateCreditButton refetch={tableProps.fetch} />
        </>
      }
    />
  );
};
