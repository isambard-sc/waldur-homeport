import { FC } from 'react';
import { useSelector } from 'react-redux';

import { ENV } from '@waldur/configs/default';
import { formatDateTime } from '@waldur/core/dateUtils';
import { isFeatureVisible } from '@waldur/features/connect';
import { MarketplaceFeatures } from '@waldur/FeaturesEnums';
import { translate } from '@waldur/i18n';
import { ResourceImportButton } from '@waldur/marketplace/resources/import/ResourceImportButton';
import { ResourceMultiSelectAction } from '@waldur/marketplace/resources/mass-actions/ResourceMultiSelectAction';
import { Table } from '@waldur/table';
import { BooleanField } from '@waldur/table/BooleanField';
import { SLUG_COLUMN } from '@waldur/table/slug';
import { TableProps } from '@waldur/table/types';
import { renderFieldOrDash } from '@waldur/table/utils';
import { getCustomer, getProject } from '@waldur/workspace/selectors';

import { Resource } from '../types';

import { CreateResourceButton } from './CreateResourceButton';
import { ExpandableResourceSummary } from './ExpandableResourceSummary';
import { ProjectResourcesAllFilter } from './ProjectResourcesAllFilter';
import { ResourceActionsButton } from './ResourceActionsButton';
import { ResourceNameField } from './ResourceNameField';
import { ResourceStateField } from './ResourceStateField';

interface FieldProps {
  row: Resource;
}

interface ResourcesAllListTableProps extends TableProps {
  hasProjectColumn?: boolean;
  hasCustomerColumn?: boolean;
  context?: 'organization' | 'project';
}

const AddResourceButton = ({
  context,
}: Pick<ResourcesAllListTableProps, 'context'>) => {
  const customer = useSelector(getCustomer);
  const project = useSelector(getProject);

  return (
    <CreateResourceButton
      organization={context ? customer : undefined}
      project={context === 'project' ? project : undefined}
    />
  );
};

export const ResourcesAllListTable: FC<ResourcesAllListTableProps> = (
  props,
) => {
  return (
    <Table
      {...props}
      filters={
        <ProjectResourcesAllFilter
          hasProjectFilter={props.hasProjectColumn}
          hasCustomerFilter={props.hasCustomerColumn}
        />
      }
      columns={[
        {
          title: translate('Name'),
          render: ResourceNameField,
          orderField: 'name',
          id: 'name',
          keys: ['name'],
          export: (row) => row.name || row.offering_name, // render as ResourceNameField label
        },
        {
          title: translate('UUID'),
          render: ({ row }) => <>{row.uuid}</>,
          id: 'uuid',
          keys: ['uuid'],
          optional: true,
        },
        {
          title: translate('Backend ID'),
          render: ({ row }) => renderFieldOrDash(row.backend_id),
          id: 'backend_id',
          keys: ['backend_id'],
          optional: true,
        },
        {
          title: translate('Category'),
          render: ({ row }: FieldProps) => <>{row.category_title}</>,
          filter: 'category',
          id: 'category',
          keys: ['category_title'],
          export: (row) => row.category_title,
        },
        {
          title: translate('Offering'),
          render: ({ row }: FieldProps) => <>{row.offering_name}</>,
          filter: 'offering',
          id: 'offering',
          keys: ['offering_name'],
          export: (row) => row.offering_name,
        },
        {
          title: translate('Plan'),
          render: ({ row }: FieldProps) => <>{row.plan_name || 'N/A'}</>,
          id: 'plan',
          keys: ['plan_name'],
          optional: true,
        },
        ...(props.hasCustomerColumn
          ? [
              {
                title: translate('Organization'),
                render: ({ row }) => <>{row.customer_name}</>,
                filter: 'organization',
                id: 'organization',
                keys: ['customer_name'],
                export: (row) => row.customer_name,
              },
            ]
          : []),
        ...(props.hasProjectColumn
          ? [
              {
                title: translate('Project'),
                render: ({ row }) => <>{row.project_name}</>,
                filter: 'project',
                id: 'project',
                keys: ['project_name'],
                export: (row) => row.project_name,
              },
            ]
          : []),
        {
          title: translate('Project end date'),
          render: ({ row }) => <>{row.project_end_date || 'N/A'}</>,
          id: 'project_end_date',
          keys: ['project_end_date'],
          optional: true,
        },
        {
          title: translate('Created at'),
          render: ({ row }) => <>{formatDateTime(row.created)}</>,
          orderField: 'created',
          id: 'created',
          keys: ['created'],
          export: (row) => formatDateTime(row.created),
        },
        ENV.plugins.WALDUR_MARKETPLACE.ENABLE_RESOURCE_END_DATE && {
          title: translate('Termination date'),
          render: ({ row }) => <>{row.end_date || 'N/A'}</>,
          id: 'end_date',
          keys: ['end_date'],
          optional: true,
          export: (row) => row.end_date,
        },
        {
          title: translate('State'),
          render: ({ row }) => (
            <ResourceStateField resource={row} outline pill />
          ),
          filter: 'state',
          id: 'state',
          keys: ['state', 'backend_metadata'],
          export: (row) =>
            row.backend_metadata?.runtime_state ||
            row.backend_metadata?.state ||
            row.state,
        },
        {
          title: translate('Paused'),
          render: ({ row }) => <BooleanField value={row.paused} />,
          id: 'paused',
          keys: ['paused'],
          optional: true,
        },
        {
          title: translate('Downscaled'),
          render: ({ row }) => <BooleanField value={row.downscaled} />,
          id: 'downscaled',
          keys: ['downscaled'],
          optional: true,
        },
        {
          title: translate('Restrict member access'),
          render: ({ row }) => (
            <BooleanField value={row.restrict_member_access} />
          ),
          id: 'restrict_member_access',
          keys: ['restrict_member_access'],
          optional: true,
        },

        SLUG_COLUMN,
      ]}
      hasOptionalColumns
      title={translate('Resources')}
      verboseName={translate('Resources')}
      initialSorting={{ field: 'created', mode: 'desc' }}
      rowActions={({ row }) => (
        <ResourceActionsButton row={row} refetch={props.fetch} />
      )}
      hasQuery={true}
      enableExport
      showPageSizeSelector={true}
      expandableRow={ExpandableResourceSummary}
      enableMultiSelect={true}
      multiSelectActions={ResourceMultiSelectAction}
      tableActions={
        <>
          {isFeatureVisible(MarketplaceFeatures.import_resources) && (
            <ResourceImportButton />
          )}
          <AddResourceButton context={props.context} />
        </>
      }
    />
  );
};
