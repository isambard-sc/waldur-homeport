import { Check, X } from '@phosphor-icons/react';
import React, { FunctionComponent } from 'react';
import { Button } from 'react-bootstrap';
import { useSelector, useDispatch } from 'react-redux';
import { getFormValues } from 'redux-form';
import { createSelector } from 'reselect';

import { Badge } from '@waldur/core/Badge';
import { formatDateTime } from '@waldur/core/dateUtils';
import { lazyComponent } from '@waldur/core/lazyComponent';
import { BackendIdTip } from '@waldur/core/Tooltip';
import { translate } from '@waldur/i18n';
import { ExpandableResourceSummary } from '@waldur/marketplace/resources/list/ExpandableResourceSummary';
import { ResourceMultiSelectAction } from '@waldur/marketplace/resources/mass-actions/ResourceMultiSelectAction';
import { Category, Offering } from '@waldur/marketplace/types';
import { openModalDialog } from '@waldur/modal/actions';
import { createFetcher } from '@waldur/table/api';
import Table from '@waldur/table/Table';
import { useTable } from '@waldur/table/useTable';
import {
  getCustomer,
  getUser,
  isOwnerOrStaff,
  isServiceManagerSelector,
} from '@waldur/workspace/selectors';
import { Customer, Project } from '@waldur/workspace/types';

import {
  PROVIDER_RESOURCES_LIST_FILTER_FORM_ID,
  TABLE_PUBLIC_RESOURCE,
} from './constants';
import { EndDateTooltip } from './EndDateTooltip';
import { ProviderResourceActions } from './ProviderResourceActions';
import { ProviderResourcesFilter } from './ProviderResourcesFilter';
import { PublicResourcesLimits } from './PublicResourcesLimits';
import { ResourceStateField } from './ResourceStateField';
import { getStates, NON_TERMINATED_STATES } from './ResourceStateFilter';

interface ResourceFilter {
  state?: any;
  organization?: Customer;
  project?: Project;
  category?: Category;
  offering?: Offering;
  include_terminated?: boolean;
}

const ResourceDetailsDialog = lazyComponent(() =>
  import('../details/popup/ResourceDetailsDialog').then((module) => ({
    default: module.ResourceDetailsDialog,
  })),
);

const ResourceField = ({ row }) => {
  const dispatch = useDispatch();
  const callback = () => {
    dispatch(
      openModalDialog(ResourceDetailsDialog, {
        resolve: { resource: row },
      }),
    );
  };
  return (
    <>
      <Button variant="flush" className="text-anchor" onClick={callback}>
        {row.name || row.offering_name}
      </Button>
      <BackendIdTip backendId={row.backend_id} />
      <EndDateTooltip end_date={row.end_date} />
    </>
  );
};

const TableComponent: FunctionComponent<any> = (props) => {
  React.useEffect(() => {
    props.resetPagination();
  }, [props.filter]);
  const columns = [
    {
      title: translate('Name'),
      render: ResourceField,
      copyField: (row) => row.name || row.offering_name,
      orderField: 'name',
      id: 'name',
      export: 'name',
      keys: ['name', 'backend_id', 'uuid'],
    },
    {
      title: translate('Resource UUID'),
      id: 'uuid',
      keys: ['uuid'],
      render: ({ row }) => <>{row.uuid}</>,
      export: 'uuid',
      optional: true,
    },
    {
      title: translate('Offering'),
      render: ({ row }) => <>{row.offering_name}</>,
      export: 'offering_name',
      keys: ['offering_name'],
      id: 'offering_name',
    },
    {
      title: translate('Client organization'),
      render: ({ row }) => <>{row.customer_name}</>,
      filter: 'organization',
      inlineFilter: (row) => ({
        name: row.customer_name,
        uuid: row.customer_uuid,
      }),
      keys: ['customer_name'],
      export: 'customer_name',
      id: 'customer_name',
    },
    {
      title: translate('Project'),
      render: ({ row }) => <>{row.project_name}</>,
      keys: ['project_name'],
      filter: 'project_name',
      inlineFilter: (row) => ({
        name: row.project_name,
        uuid: row.project_uuid,
      }),
      export: 'project_name',
      id: 'project_name',
    },
    {
      title: translate('Category'),
      render: ({ row }) => <>{row.category_title}</>,
      filter: 'category',
      inlineFilter: (row) => ({
        title: row.category_title,
        uuid: row.category_uuid,
      }),
      keys: ['category_title', 'category_uuid'],
      export: 'category_title',
      id: 'category_title',
    },
    {
      title: translate('Plan'),
      render: ({ row }) => <>{row.plan_name || 'N/A'}</>,
      export: 'plan_name',
      keys: ['plan_name'],
      optional: true,
      id: 'plan',
    },
    {
      title: translate('Limits'),
      render: PublicResourcesLimits,
      export: (row) => JSON.stringify(row.limits),
      keys: ['limits'],
      exportKeys: ['limits'],
      optional: true,
      id: 'limits',
    },
    {
      title: translate('Effective ID'),
      render: ({ row }) => <>{row.effective_id || 'N/A'}</>,
      export: 'effective_id',
      optional: true,
      keys: ['effective_id'],
      id: 'effective_id',
    },
    {
      title: translate('Backend ID'),
      render: ({ row }) => <>{row.backend_id || 'N/A'}</>,
      export: 'backend_id',
      optional: true,
      keys: ['backend_id'],
      id: 'backend_id',
    },
    {
      title: translate('Requested downscaling'),
      render: ({ row }) =>
        !row.downscaled ? (
          <Badge variant="danger" outline pill size="sm">
            <X size={12} className="text-danger me-2" />
            {translate('No')}
          </Badge>
        ) : (
          <Badge variant="success" outline pill size="sm">
            <Check size={12} className="text-success me-2" />
            {translate('Yes')}
          </Badge>
        ),
      export: 'downscaled',
      keys: ['downscaled'],
      exportKeys: ['downscaled'],
      optional: true,
      id: 'downscaled',
    },
    {
      title: translate('Restrict member access'),
      render: ({ row }) =>
        !row.restrict_member_access ? (
          <Badge variant="danger" outline pill size="sm">
            <X size={12} className="text-danger me-2" />
            {translate('No')}
          </Badge>
        ) : (
          <Badge variant="success" outline pill size="sm">
            <Check size={12} className="text-success me-2" />
            {translate('Yes')}
          </Badge>
        ),
      export: 'restrict_member_access',
      keys: ['restrict_member_access'],
      exportKeys: ['restrict_member_access'],
      optional: true,
      id: 'restrict_member_access',
    },
    {
      title: translate('Requested pausing'),
      render: ({ row }) =>
        !row.paused ? (
          <Badge variant="danger" outline pill size="sm">
            <X size={12} className="text-danger me-2" />
            {translate('No')}
          </Badge>
        ) : (
          <Badge variant="success" outline pill size="sm">
            <Check size={12} className="text-success me-2" />
            {translate('Yes')}
          </Badge>
        ),
      export: 'paused',
      keys: ['paused'],
      exportKeys: ['paused'],
      optional: true,
      id: 'paused',
    },
    {
      title: translate('Created at'),
      render: ({ row }) => formatDateTime(row.created),
      orderField: 'created',
      export: (row) => formatDateTime(row.created),
      exportKeys: ['created'],
      id: 'created',
      keys: ['created'],
    },
    {
      title: translate('State'),
      render: ({ row }) => <ResourceStateField resource={row} outline pill />,
      filter: 'state',
      inlineFilter: (row) => getStates().filter((op) => op.value === row.state),
      id: 'state',
      keys: ['state', 'backend_metadata'],
      export: (row) =>
        row.backend_metadata?.runtime_state ||
        row.backend_metadata?.state ||
        row.state,
    },
  ];

  return (
    <Table
      {...props}
      columns={columns}
      verboseName={translate('Resources')}
      title={translate('Resources')}
      enableExport={true}
      initialSorting={{ field: 'created', mode: 'desc' }}
      hasQuery={true}
      hasOptionalColumns
      showPageSizeSelector={true}
      expandableRow={ExpandableResourceSummary}
      rowActions={({ row }) => (
        <ProviderResourceActions resource={row} refetch={props.fetch} />
      )}
      enableMultiSelect={true}
      multiSelectActions={ResourceMultiSelectAction}
    />
  );
};

const TableOptions = {
  table: TABLE_PUBLIC_RESOURCE,
  fetchData: createFetcher('marketplace-provider-resources'),
  queryField: 'query',
};

const mapStateToFilter = createSelector(
  getCustomer,
  getUser,
  isServiceManagerSelector,
  isOwnerOrStaff,
  (state, formId) => getFormValues(formId)(state),
  (customer, user, isServiceManager, ownerOrStaff, filters: ResourceFilter) => {
    const filter: Record<string, string | string[] | boolean> = {};

    // Public resources should only contain resources from billable offerings.
    filter.billable = true;

    if (customer) {
      filter.provider_uuid = customer.uuid;
    }
    if (filters?.offering) {
      filter.offering_uuid = filters.offering.uuid;
    }
    if (filters?.state) {
      filter.state = filters.state.map((option) => option.value) as string[];
      if (filters?.include_terminated) {
        filter.state = [...filter.state, 'Terminated'];
      }
    } else {
      if (!filters?.include_terminated) {
        filter.state = NON_TERMINATED_STATES.map((option) => option.value);
      }
    }
    if (filters?.organization) {
      filter.customer_uuid = filters.organization.uuid;
    }
    if (filters?.project) {
      filter.project_uuid = filters.project.uuid;
    }
    if (filters?.category) {
      filter.category_uuid = filters.category.uuid;
    }
    if (isServiceManager && !ownerOrStaff) {
      filter.service_manager_uuid = user.uuid;
    }
    return filter;
  },
);

const mandatoryFields = [
  'uuid', // Almost all actions
  'name', // Almost all actions
  'url', // CreateRobotAccountAction
  'customer_uuid', // ReportUsageAction, SetBackendIdAction
  'customer_name', // ShowUsageAction, ReportUsageAction
  'project_uuid', // CreateRobotAccountAction
  'project_name', // ShowUsageAction, ReportUsageAction
  'offering_uuid', // ShowUsageAction, ReportUsageAction
  'offering_customer_uuid', // CreateRobotAccountAction
  'offering_plugin_options', // CreateRobotAccountAction
  'backend_id', // ShowUsageAction, ReportUsageAction, SetBackendIdAction
  'is_usage_based', // Expandable view, ShowUsageAction, ReportUsageAction
  'is_limit_based', // Expandable view, ShowUsageAction, ReportUsageAction
  'limits', // Expandable view
  'limit_usage', // Expandable view
  'current_usages', // Expandable view
  'state', // Almost all actions
  'slug', // SetSlugAction
  'end_date', // EditResourceEndDateByProviderAction, EditResourceEndDateByStaffAction
  'resource_type', // TerminateAction
];

export const ProviderResourcesList: React.ComponentType<any> = () => {
  const filter = useSelector((state) =>
    mapStateToFilter(state, PROVIDER_RESOURCES_LIST_FILTER_FORM_ID),
  );
  const tableProps = useTable({
    ...TableOptions,
    filter,
    mandatoryFields,
  });
  return (
    <TableComponent {...tableProps} filters={<ProviderResourcesFilter />} />
  );
};
