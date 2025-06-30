import { FC } from 'react';
import { useSelector } from 'react-redux';
import { getFormValues } from 'redux-form';
import { createSelector } from 'reselect';

import { translate } from '@waldur/i18n';
import { createFetcher } from '@waldur/table/api';
import Table from '@waldur/table/Table';
import { useTable } from '@waldur/table/useTable';
import { getCustomer } from '@waldur/workspace/selectors';

import { PROJECT_REQUESTS_FILTER_FORM_ID } from '../constants';

import { ProjectRequestItemActions } from './ProjectRequestItemActions';
import { ProjectRequestsListExpandableRow } from './ProjectRequestsListExpandableRow';
import { ProjectRequestsTableFilter } from './ProjectRequestsTableFilter';
import { RequestedProjectsListData } from './RequestedProjectsListData';
import { RequestedProject } from './RequestedProject';

interface ProjectRequestsListProps {
}

const filtersSelector = createSelector(
  getCustomer,
  getFormValues(PROJECT_REQUESTS_FILTER_FORM_ID),
  (customer, filters: any) => {
    const result: RequestedProjectsListData['query'] = {};
    if (customer) {
      result.provider_uuid = customer.uuid;
    }
    if (filters?.state) {
      result.state = filters.state.map((option) => option.value);
    }
    if (filters?.organization) {
      result.organization_uuid = filters.organization.uuid;
    }
    if (filters?.offering) {
      result.offering = filters.offering.url;
    }
    return result;
  },
);

export const ProjectRequestsList: FC<ProjectRequestsListProps> = () => {
  const filter = useSelector(filtersSelector);

  const tableProps = useTable({
    table: 'RequestedProjectsList',
    fetchData: createFetcher('openportal/requested-projects'),
    filter,
  });

  return (
    <Table<RequestedProject>
      {...tableProps}
      columns={[
        {
          title: translate('Name'),
          render: ({ row }) => <>{row.name}</>,
          filter: 'name',
        },
        {
          title: translate('Organisation'),
          render: ({ row }) => <>{row.organization}</>,
          filter: 'organization',
        },
        {
          title: translate('Project Class'),
          render: ({ row }) => <>{row.project_class}</>,
          filter: 'project_class',
        },
        {
          title: translate('Start date'),
          render: ({ row }) => <>{row.start_date}</>,
          filter: 'start_date',
        },
        {
          title: translate('End date'),
          render: ({ row }) => <>{row.end_date}</>,
          filter: 'end_date',
        },
        {
          title: translate('Allocation'),
          render: ({ row }) => <>{row.allocation}</>,
          filter: 'allocation',
        },
      ]}
      title={translate('Requests for projects')}
      verboseName={translate('Requests for projects')}
      hasQuery={true}
      expandableRow={ProjectRequestsListExpandableRow}
      rowActions={ProjectRequestItemActions}
      filters={<ProjectRequestsTableFilter />}
    />
  );
};
