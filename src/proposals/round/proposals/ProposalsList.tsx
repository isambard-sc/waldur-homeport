import { FC } from 'react';

import { formatDateTime } from '@waldur/core/dateUtils';
import { translate } from '@waldur/i18n';
import { ProposalBadge } from '@waldur/proposals/proposal/ProposalBadge';
import { Call, Round } from '@waldur/proposals/types';
import { createFetcher } from '@waldur/table/api';
import Table from '@waldur/table/Table';
import { useTable } from '@waldur/table/useTable';

import { ProposalRowActions } from '../../proposal/ProposalRowActions';

import { ProposalExpandableRow } from './ProposalExpandableRow';

interface RoundProposalsListProps {
  round: Round;
  call: Call;
}

export const ProposalsList: FC<RoundProposalsListProps> = (props) => {
  const tableProps = useTable({
    table: 'RoundProposalsList',
    fetchData: createFetcher(
      `proposal-protected-calls/${props.call.uuid}/rounds/${props.round.uuid}`,
    ),
    queryField: 'name',
  });

  return (
    <Table
      {...tableProps}
      id="proposals"
      columns={[
        {
          title: translate('Name'),
          render: ({ row }) => <>{row.name}</>,
          copyField: (row) => row.name,
        },
        {
          title: translate('By'),
          render: ({ row }) => <>{row.created_by_name || '-'} </>,
        },
        {
          title: translate('Created'),
          render: ({ row }) => <>{formatDateTime(row.created)}</>,
        },
        {
          title: translate('State'),
          render: ({ row }) => <ProposalBadge state={row.state} />,
        },
      ]}
      title={translate('Proposals')}
      verboseName={translate('Proposals')}
      expandableRow={ProposalExpandableRow}
      hasQuery={true}
      rowActions={({ row }) => (
        <ProposalRowActions
          row={{
            ...row,
            call_uuid: props.call.uuid,
            call_manager_uuid: props.call.customer_uuid,
          }}
          refetch={tableProps.fetch}
        />
      )}
    />
  );
};
