import { FunctionComponent, useMemo } from 'react';
import { ButtonGroup } from 'react-bootstrap';
import { useSelector } from 'react-redux';

import { formatDate, formatDateTime } from '@waldur/core/dateUtils';
import { isFeatureVisible } from '@waldur/features/connect';
import { ProjectFeatures } from '@waldur/FeaturesEnums';
import { translate } from '@waldur/i18n';
import { PROJECTS_LIST } from '@waldur/project/constants';
import { ProjectsListActions } from '@waldur/project/ProjectsListActions';
import { Table, createFetcher } from '@waldur/table';
import { DASH_ESCAPE_CODE } from '@waldur/table/constants';
import { formatLongText, useTable } from '@waldur/table/utils';
import { getCustomer } from '@waldur/workspace/selectors';

import { ProjectCostField } from './ProjectCostField';
import { ProjectCreateButton } from './ProjectCreateButton';
import { ProjectDetailsButton } from './ProjectDetailsButton';
import { ProjectExpandableRowContainer } from './ProjectExpandableRowContainer';
import { ProjectLink } from './ProjectLink';
import { ProjectTablePlaceholder } from './ProjectTablePlaceholder';

export const ProjectsList: FunctionComponent<{}> = () => {
  const customer = useSelector(getCustomer);
  const filter = useMemo(
    () => ({
      customer: customer.uuid,
      field: [
        'uuid',
        'name',
        'description',
        'created',
        'billing_price_estimate',
        'type_name',
        'end_date',
        'backend_id',
        'oecd_fos_2007_code',
        'is_industry',
        'marketplace_resource_count',
        'image',
      ],
      o: 'name',
    }),
    [customer],
  );
  const props = useTable({
    table: PROJECTS_LIST,
    fetchData: createFetcher('projects'),
    queryField: 'query',
    filter,
    exportRow: (row) => [
      row.name,
      row.description,
      formatDateTime(row.created),
    ],
    exportFields: ['Name', 'Description', 'Created'],
  });
  const columns = [
    {
      title: translate('Name'),
      render: ProjectLink,
      orderField: 'name',
    },
    {
      title: translate('Description'),
      render: ({ row }) => <>{formatLongText(row.description)}</>,
    },
    {
      title: translate('Created'),
      render: ({ row }) => <>{formatDateTime(row.created)}</>,
      orderField: 'created',
    },
    {
      title: translate('End date'),
      render: ({ row }) => (
        <>{row.end_date ? formatDate(row.end_date) : DASH_ESCAPE_CODE}</>
      ),
      orderField: 'end_date',
    },
  ];
  if (isFeatureVisible(ProjectFeatures.estimated_cost)) {
    columns.push({
      title: translate('Estimated cost'),
      render: ProjectCostField,
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
      placeholderComponent={<ProjectTablePlaceholder />}
      actions={<ProjectCreateButton />}
      hoverableRow={({ row }) => (
        <ButtonGroup>
          <ProjectsListActions project={row} />
          <ProjectDetailsButton project={row} />
        </ButtonGroup>
      )}
      expandableRow={ProjectExpandableRowContainer}
      enableExport={true}
    />
  );
};
