import { FunctionComponent } from 'react';

import { translate } from '@waldur/i18n';
import { ActionsDropdown } from '@waldur/table/ActionsDropdown';
import { createFetcher } from '@waldur/table/api';
import Table from '@waldur/table/Table';
import { useTable } from '@waldur/table/useTable';
import { renderFieldOrDash } from '@waldur/table/utils';

import { ProjectTemplateCreateButton } from './ProjectTemplateCreateButton';
import { ProjectTemplateDeleteButton } from './ProjectTemplateDeleteButton';
import { ProjectTemplateEditButton } from './ProjectTemplateEditButton';
import { ProjectTemplateExpandableRow } from './ProjectTemplateExpandableRow';

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
  return <a key={customer.uuid} href={url} target="_blank" rel="noopener noreferrer">{customer.display_name}</a>;
}

export const ProjectTemplateList: FunctionComponent<{}> = () => {
  const props = useTable({
    table: 'project-template',
    fetchData: createFetcher('openportal-project-template'),
  });
  return (
    <Table
      {...props}
      columns={[
        {
          title: translate('Name'),
          render: ({ row }) => renderFieldOrDash(row.name),
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
      verboseName={translate('project templatees')}
      rowActions={ProjectTemplateRowActions}
      expandableRow={ProjectTemplateExpandableRow}
      tableActions={<ProjectTemplateCreateButton refetch={props.fetch} />}
    />
  );
};
