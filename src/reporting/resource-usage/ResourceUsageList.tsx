import { FC } from 'react';
import { useSelector } from 'react-redux';
import { getFormValues } from 'redux-form';
import { createSelector } from 'reselect';

import { formatDateTime } from '@waldur/core/dateUtils';
import { translate } from '@waldur/i18n';
import { getStartAndEndDatesOfMonth } from '@waldur/issues/utils';
import {
  UsageReport,
  UsageReportRequest,
} from '@waldur/marketplace/resources/usage/types';
import { createFetcher } from '@waldur/table/api';
import { ExpandableContainer } from '@waldur/table/ExpandableContainer';
import Table from '@waldur/table/Table';
import { Column } from '@waldur/table/types';
import { useTable } from '@waldur/table/useTable';

import { FORM_ID, ResourceUsageFilter } from './ResourceUsageFilter';

const UsageExpandableRow = ({ row }) => (
  <ExpandableContainer>
    <p>
      <strong>{translate('Comment')}</strong>: {row.description || 'N/A'}
    </p>
  </ExpandableContainer>
);

export const ResourceUsageList: FC = () => {
  const filter = useSelector(mapStateToFilter);
  const props = useTable({
    table: 'ResourceUsageReports',
    fetchData: createFetcher('marketplace-component-usages'),
    filter,
  });
  const columns: Array<Column<UsageReport>> = [
    {
      title: translate('Client organization'),
      render: ({ row }) => <>{row.customer_name}</>,
      filter: 'organization',
      inlineFilter: (row) => ({
        name: row.customer_name,
        uuid: row.customer_uuid,
      }),
      export: 'customer_name',
    },
    {
      title: translate('Client project'),
      render: ({ row }) => <>{row.project_name}</>,
      filter: 'project',
      inlineFilter: (row) => ({
        name: row.project_name,
        uuid: row.project_uuid,
      }),
      export: 'project_name',
    },
    {
      title: translate('Offering'),
      render: ({ row }) => <>{row.offering_name}</>,
      filter: 'offering',
      inlineFilter: (row) => ({
        name: row.offering_name,
        uuid: row.offering_uuid,
      }),
      export: 'offering_name',
    },
    {
      title: translate('Resource name'),
      render: ({ row }) => <>{row.resource_name}</>,
      export: 'resource_name',
    },
    {
      title: translate('Plan component name'),
      render: ({ row }) => <>{row.name}</>,
      export: 'name',
    },
    {
      title: translate('Date of reporting'),
      render: ({ row }) => <>{formatDateTime(row.date)}</>,
      export: (row) => formatDateTime(row.date),
      exportKeys: ['date'],
    },
    {
      title: translate('Value'),
      render: ({ row }) => <>{row.usage + ' ' + row.measured_unit}</>,
      export: (row) => row.usage + ' ' + row.measured_unit,
      exportKeys: ['usage', 'measured_unit'],
    },
    {
      visible: false,
      title: translate('Comment'),
      render: null,
      export: 'description',
    },
  ];

  return (
    <Table
      {...props}
      columns={columns}
      verboseName={translate('Usages')}
      showPageSizeSelector={true}
      enableExport={true}
      expandableRow={UsageExpandableRow}
      filters={<ResourceUsageFilter />}
    />
  );
};

const mapStateToFilter = createSelector(
  getFormValues(FORM_ID),
  (usageFilter: any) => {
    const filter: UsageReportRequest = {};
    if (usageFilter) {
      if (usageFilter.accounting_period) {
        const { start } = getStartAndEndDatesOfMonth(
          usageFilter.accounting_period.value,
        );
        filter.billing_period = start;
      }
      if (usageFilter.organization) {
        filter.customer_uuid = usageFilter.organization.uuid;
      }
      if (usageFilter.project) {
        filter.project_uuid = usageFilter.project.uuid;
      }
      if (usageFilter.offering) {
        filter.offering_uuid = usageFilter.offering.uuid;
      }
    }
    return filter;
  },
);
