import { FC } from 'react';
import { useSelector } from 'react-redux';

import { defaultCurrency } from '@waldur/core/formatCurrency';
import { translate } from '@waldur/i18n';
import { createFetcher } from '@waldur/table/api';
import Table from '@waldur/table/Table';
import { useTable } from '@waldur/table/useTable';
import { renderFieldOrDash } from '@waldur/table/utils';
import { getCustomer } from '@waldur/workspace/selectors';

import { ProjectCreateCreditButton } from './ProjectCreateCreditButton';
import { ProjectCreditActions } from './ProjectCreditActions';
import { ProjectCredit } from './types';

export const ProjectCreditsList: FC = () => {
  const customer = useSelector(getCustomer);
  const tableProps = useTable({
    table: 'ProjectCreditsList',
    fetchData: createFetcher('project-credits', {
      params: { customer_uuid: customer.uuid },
    }),
    queryField: 'query',
  });

  return (
    <Table<ProjectCredit>
      {...tableProps}
      columns={[
        {
          title: translate('Name'),
          render: ({ row }) => renderFieldOrDash(row.project_name),
          orderField: 'project_name',
          export: 'project_name',
        },
        {
          title: translate('Allocated credit'),
          render: ({ row }) => defaultCurrency(row.value),
          orderField: 'value',
          export: 'value',
        },
        {
          title: translate('Eligible offerings'),
          render: ({ row }) => (
            <>
              {renderFieldOrDash(
                row.offerings.map((offering) => offering.name).join(', '),
              )}
            </>
          ),
          export: (row) =>
            renderFieldOrDash(
              row.offerings.map((offering) => offering.name).join(', '),
            ),
        },
      ]}
      title={translate('Credit management')}
      verboseName={translate('Credits')}
      hasQuery
      enableExport
      rowActions={ProjectCreditActions}
      tableActions={<ProjectCreateCreditButton refetch={tableProps.fetch} />}
    />
  );
};
