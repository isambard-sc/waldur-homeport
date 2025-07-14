import { FunctionComponent } from 'react';

import { translate } from '@waldur/i18n';
import { ActionsDropdown } from '@waldur/table/ActionsDropdown';
import { createFetcher } from '@waldur/table/api';
import Table from '@waldur/table/Table';
import { useTable } from '@waldur/table/useTable';
import { renderFieldOrDash } from '@waldur/table/utils';

import { ProjectClassCreateButton } from './ProjectClassCreateButton';
import { ProjectClassDeleteButton } from './ProjectClassDeleteButton';
import { ProjectClassEditButton } from './ProjectClassEditButton';
import { ProjectClassExpandableRow } from './ProjectClassExpandableRow';

const ProjectClassRowActions = ({ row, fetch }) => (
  <ActionsDropdown
    row={row}
    refetch={fetch}
    actions={[ProjectClassEditButton, ProjectClassDeleteButton].filter(
      Boolean,
    )}
  />
);

export const ProjectClassList: FunctionComponent<{}> = () => {
  const props = useTable({
    table: 'project-class',
    fetchData: createFetcher('openportal-project-class'),
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
      ]}
      verboseName={translate('project classes')}
      rowActions={ProjectClassRowActions}
      expandableRow={ProjectClassExpandableRow}
      tableActions={<ProjectClassCreateButton refetch={props.fetch} />}
    />
  );
};
