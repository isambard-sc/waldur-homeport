import { FunctionComponent, useMemo } from 'react';
import { useSelector } from 'react-redux';

import { formatDate, formatDateTime } from '@waldur/core/dateUtils';
import { isFeatureVisible } from '@waldur/features/connect';
import { ProjectFeatures } from '@waldur/FeaturesEnums';
import { translate } from '@waldur/i18n';
import { PROJECTS_LIST } from '@waldur/project/constants';
import { ProjectsListActions } from '@waldur/project/ProjectsListActions';
import { createFetcher } from '@waldur/table/api';
import { DASH_ESCAPE_CODE } from '@waldur/table/constants';
import Table from '@waldur/table/Table';
import { Column } from '@waldur/table/types';
import { useTable } from '@waldur/table/useTable';
import { formatLongText } from '@waldur/table/utils';
import { getCustomer } from '@waldur/workspace/selectors';

import { ProjectCreateButton } from './create/ProjectCreateButton';
import { ProjectCostField } from './ProjectCostField';
import { ProjectExpandableRowContainer } from './ProjectExpandableRowContainer';
import { ProjectLink } from './ProjectLink';

const mandatoryFields = [
  'uuid',
  'name', // Actions
  'customer_name', // DeleteAction
  'customer_uuid', // DeleteAction
  'marketplace_resource_count', // Expandable view
  'backend_id', // Expandable view
];

export const ProjectsList: FunctionComponent<{}> = () => {
  const customer = useSelector(getCustomer);
  const filter = useMemo(
    () => ({
      customer: customer.uuid,
      o: 'name',
    }),
    [customer],
  );
  const props = useTable({
    table: PROJECTS_LIST,
    fetchData: createFetcher('projects'),
    queryField: 'query',
    filter,
    mandatoryFields,
  });
  const columns: Column[] = [
    {
      title: translate('Name'),
      render: ProjectLink,
      copyField: (row) => row.name,
      orderField: 'name',
      export: 'name',
      id: 'name',
      keys: ['uuid', 'name', 'is_industry'],
    },
    {
      title: translate('Description'),
      render: ({ row }) => <>{formatLongText(row.description)}</>,
      export: 'description',
      id: 'description',
      keys: ['description'],
    },
    {
      title: translate('Created'),
      render: ({ row }) => <>{formatDateTime(row.created)}</>,
      orderField: 'created',
      export: (row) => formatDateTime(row.created),
      exportKeys: ['created'],
      id: 'created',
      keys: ['created'],
    },
    {
      title: translate('Start date'),
      render: ({ row }) => (
        <>{row.start_date ? formatDate(row.start_date) : DASH_ESCAPE_CODE}</>
      ),
      orderField: 'start_date',
      export: false,
      id: 'start_date',
      optional: true,
      keys: ['start_date'],
    },
    {
      title: translate('End date'),
      render: ({ row }) => (
        <>{row.end_date ? formatDate(row.end_date) : DASH_ESCAPE_CODE}</>
      ),
      orderField: 'end_date',
      export: false,
      id: 'end_date',
      keys: ['end_date'],
    },
  ];
  if (isFeatureVisible(ProjectFeatures.estimated_cost)) {
    columns.push({
      title: translate('Estimated cost'),
      render: ProjectCostField,
      export: false,
      id: 'estimated_cost',
      keys: ['billing_price_estimate'],
    });
  }

  return (
    <Table
      {...props}
      title={translate('Projects')}
      columns={columns}
      verboseName={translate('projects')}
      initialSorting={{ field: 'created', mode: 'desc' }}
      hasQuery={true}
      showPageSizeSelector={true}
      tableActions={<ProjectCreateButton refetch={props.fetch} />}
      rowActions={({ row }) => (
        <ProjectsListActions project={row} refetch={props.fetch} />
      )}
      expandableRow={ProjectExpandableRowContainer}
      enableExport={true}
      hasOptionalColumns
    />
  );
};
