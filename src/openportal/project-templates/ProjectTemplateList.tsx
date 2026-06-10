import { FunctionComponent } from 'react';
import { openportalProjectTemplateList } from 'waldur-js-client';

import { translate } from '@waldur/i18n';
import { Link } from '@waldur/core/Link';
import { ActionsDropdown } from '@waldur/table/ActionsDropdown';
import { createFetcher } from '@waldur/table/api';
import Table from '@waldur/table/Table';
import { useTable } from '@waldur/table/useTable';
import { renderFieldOrDash } from '@waldur/table/utils';

import { ProjectTemplateCreateButton } from './ProjectTemplateCreateButton';
import { ProjectTemplateDeleteButton } from './ProjectTemplateDeleteButton';
import { ProjectTemplateEditButton } from './ProjectTemplateEditButton';

const ProjectTemplateRowActions = ({ row, fetch }) => (
  <ActionsDropdown
    row={row}
    refetch={fetch}
    actions={[ProjectTemplateEditButton, ProjectTemplateDeleteButton].filter(
      Boolean,
    )}
  />
);

const stringify_customer = (customer: any) => {
  if (!customer) {
    return 'Not set';
  }
  // customer.url is the URL. Render it as a link, using customer.name as the display text.
  const url = `/organizations/${customer.uuid}/dashboard/`;
  return <a key={customer.uuid} href={url} target="_blank" rel="noopener noreferrer">{customer.display_name || customer.name}</a>;
}

export const ProjectTemplateList: FunctionComponent<{}> = () => {
  const props = useTable({
    table: 'project-template',
    fetchData: createFetcher(openportalProjectTemplateList),
  });
  return (
    <Table
      {...props}
      columns={[
        {
          title: translate('Name'),
          render: ({ row }) => (
            <Link
              state="marketplace-provider-project-template-detail"
              params={{ templateUuid: row.uuid }}
            >
              {row.name || '—'}
            </Link>
          ),
        },
        {
          title: translate('Offering'),
          render: ({ row }) => renderFieldOrDash(row.offering),
        },
        {
          title: translate('Portal'),
          render: ({ row }) => renderFieldOrDash(row.portal),
        },
        {
          title: translate('Organization'),
          render: ({ row }) => stringify_customer(row.customer_data),
        },
        {
          title: translate('Shortname'),
          render: ({ row }) => renderFieldOrDash(row.shortname),
        },
      ]}
      verboseName={translate('Project Templates')}
      rowActions={ProjectTemplateRowActions}
      tableActions={<ProjectTemplateCreateButton refetch={props.fetch} />}
    />
  );
};
