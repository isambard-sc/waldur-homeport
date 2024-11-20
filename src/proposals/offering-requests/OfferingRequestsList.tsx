import { FC } from 'react';
import { useSelector } from 'react-redux';
import { getFormValues } from 'redux-form';
import { createSelector } from 'reselect';

import { translate } from '@waldur/i18n';
import { Round } from '@waldur/proposals/types';
import { createFetcher } from '@waldur/table/api';
import Table from '@waldur/table/Table';
import { useTable } from '@waldur/table/useTable';
import { getCustomer } from '@waldur/workspace/selectors';

import { OFFERING_REQUESTS_FILTER_FORM_ID } from '../constants';
import { CallOfferingStateField } from '../details/CallOfferingStateField';
import { getCallOfferingStateOptions } from '../utils';

import { OfferingRequestItemActions } from './OfferingRequestItemActions';
import { OfferingRequestsListExpandableRow } from './OfferingRequestsListExpandableRow';
import { OfferingRequestsTableFilter } from './OfferingRequestsTableFilter';

interface OfferingRequestsListProps {
  round: Round;
}

const filtersSelctor = createSelector(
  getCustomer,
  getFormValues(OFFERING_REQUESTS_FILTER_FORM_ID),
  (customer, filters: any) => {
    const result: Record<string, any> = {};
    if (customer) {
      result.provider_uuid = customer.uuid;
    }
    if (filters?.state) {
      result.state = filters.state.map((option) => option.value);
    }
    if (filters?.organization) {
      result.organization_uuid = filters.organization.uuid;
    }
    if (filters?.call) {
      result.call = filters.call.url;
    }
    if (filters?.offering) {
      result.offering = filters.offering.url;
    }
    return result;
  },
);

export const OfferingRequestsList: FC<OfferingRequestsListProps> = () => {
  const filter = useSelector(filtersSelctor);

  const tableProps = useTable({
    table: 'ProposalRequestedOfferingsList',
    fetchData: createFetcher('proposal-requested-offerings'),
    queryField: 'call_name',
    filter,
  });

  return (
    <Table
      {...tableProps}
      columns={[
        {
          title: translate('Call'),
          render: ({ row }) => <b>{row.call_name}</b>,
          filter: 'call',
          inlineFilter: (row) => ({ name: row.call_name, url: row.call }),
        },
        {
          title: translate('Call manager'),
          render: ({ row }) => <>{row.call_managing_organisation}</>,
          filter: 'organization',
        },
        {
          title: translate('Offering'),
          render: ({ row }) => <>{row.offering_name}</>,
          filter: 'offering',
          inlineFilter: (row) => ({
            name: row.offering_name,
            url: row.offering,
          }),
        },
        {
          title: translate('Plan'),
          render: ({ row }) => (
            <>{row.plan ? row.plan_details.name : translate('Ordinary plan')}</>
          ),
        },
        {
          title: translate('State'),
          render: CallOfferingStateField,
          filter: 'state',
          inlineFilter: (row) =>
            getCallOfferingStateOptions().filter((s) => s.value === row.state),
        },
      ]}
      title={translate('Requests for offerings')}
      verboseName={translate('Requests for offerings')}
      hasQuery={true}
      expandableRow={OfferingRequestsListExpandableRow}
      rowActions={OfferingRequestItemActions}
      filters={<OfferingRequestsTableFilter />}
    />
  );
};
