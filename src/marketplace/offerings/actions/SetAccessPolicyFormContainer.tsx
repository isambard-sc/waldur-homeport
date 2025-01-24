import { FunctionComponent } from 'react';
import { Field } from 'redux-form';

import { translate } from '@waldur/i18n';
import { OrganizationGroup } from '@waldur/marketplace/types';
import { DASH_ESCAPE_CODE } from '@waldur/table/constants';
import Table from '@waldur/table/Table';
import { useTable } from '@waldur/table/useTable';

interface SetAccessPolicyFormContainerProps {
  organizationGroups: OrganizationGroup[];
  submitting: boolean;
}

export const SetAccessPolicyFormContainer: FunctionComponent<
  SetAccessPolicyFormContainerProps
> = ({ organizationGroups, submitting }) => {
  const tableProps = useTable({
    table: 'OrganizationGroups',
    fetchData: () =>
      Promise.resolve({
        rows: organizationGroups,
        totalCount: organizationGroups.length,
      }),
  });

  const columns = [
    {
      title: translate('Name'),
      render: ({ row }) => row.name,
    },
    {
      title: translate('Parent'),
      render: ({ row }) => row.parent_name || DASH_ESCAPE_CODE,
    },
    {
      title: translate('Select'),
      render: ({ row }) => (
        <Field
          name={row.uuid}
          type="checkbox"
          component="input"
          parse={(value) => !!value}
          format={(value) => !!value}
          props={{
            disabled: submitting,
          }}
        />
      ),
      className: 'text-center',
    },
  ];

  return (
    <Table
      {...tableProps}
      columns={columns}
      verboseName={translate('Organization groups')}
    />
  );
};
