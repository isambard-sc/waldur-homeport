import { FC } from 'react';
import { useSelector } from 'react-redux';
import { getFormValues } from 'redux-form';
import { createSelector } from 'reselect';

import {
  ALL_RESOURCES_TABLE_ID,
  PROJECT_RESOURCES_ALL_FILTER_FORM_ID,
} from '@waldur/marketplace/resources/list/constants';
import { useOrganizationAndProjectFiltersForResources } from '@waldur/navigation/sidebar/resources-filter/utils';
import { createFetcher, useTable } from '@waldur/table';
import { TableProps } from '@waldur/table/types';
import { Project } from '@waldur/workspace/types';

import { ResourcesAllListTable } from './ResourcesAllListTable';
import { NON_TERMINATED_STATES } from './ResourceStateFilter';
import { resourcesListRequiredFields } from './utils';

const mapStateToFilter = createSelector(
  getFormValues(PROJECT_RESOURCES_ALL_FILTER_FORM_ID),
  (filters: any) => {
    const result: Record<string, any> = {};
    if (filters?.offering) {
      result.offering_uuid = filters.offering.uuid;
    }
    if (filters?.state) {
      result.state = filters.state.value;
    }
    if (filters?.category) {
      result.category_uuid = filters.category.uuid;
    }
    if (filters?.project) {
      result.project_uuid = filters.project.uuid;
    }
    if (filters?.runtime_state) {
      result.runtime_state = filters.runtime_state.value;
    }
    if (filters?.state) {
      result.state = filters.state.map((option) => option.value);
      if (filters?.include_terminated) {
        result.state = [...result.state, 'Terminated'];
      }
    } else {
      if (!filters?.include_terminated) {
        result.state = NON_TERMINATED_STATES.map((option) => option.value);
      }
    }
    if (filters?.organization) {
      result.customer_uuid = filters.organization.uuid;
    }
    return result;
  },
);

interface AllResourcesListProps extends Partial<TableProps> {
  project?: Project;
}

export const AllResourcesList: FC<AllResourcesListProps> = (props) => {
  const { syncResourceFilters } =
    useOrganizationAndProjectFiltersForResources('all-resources');
  const filter = useSelector(mapStateToFilter);

  const tableProps = useTable({
    table: ALL_RESOURCES_TABLE_ID,
    fetchData: createFetcher('marketplace-resources'),
    queryField: 'query',
    filter,
    onApplyFilter: (filters) => {
      const organization = filters.find((item) => item.name === 'organization');
      const project = filters.find((item) => item.name === 'project');
      const formValues = {
        organization: organization?.value,
        project: project?.value,
      };
      syncResourceFilters(formValues);
    },
    mandatoryFields: resourcesListRequiredFields(),
  });

  return (
    <ResourcesAllListTable
      {...tableProps}
      {...props}
      hasProjectColumn
      hasCustomerColumn
      standalone={props.standalone ?? true}
    />
  );
};
