import { ChatTeardropTextIcon } from '@phosphor-icons/react';
import { FC, useMemo } from 'react';
import { useDispatch, useSelector } from 'react-redux';
import { getFormValues } from 'redux-form';
import { proposalProposalsList, Proposal, ProtectedRound } from 'waldur-js-client';

import { formatDateTime } from '@waldur/core/dateUtils';
import { Link } from '@waldur/core/Link';
import { translate } from '@waldur/i18n';
import { openModalDialog } from '@waldur/modal/actions';
import { ProposalBadge } from '@waldur/proposals/proposal/ProposalBadge';
import { Call } from '@waldur/proposals/types';
import { createFetcher } from '@waldur/table/api';
import { DASH_ESCAPE_CODE } from '@waldur/table/constants';
import Table from '@waldur/table/Table';
import { Column } from '@waldur/table/types';
import { useTable } from '@waldur/table/useTable';

import { ProposalNotesDialog } from './ProposalNotesDialog';

import { ProposalRowActions } from '../../proposal/ProposalRowActions';

import { PROPOSALS_FILTER_FORM_ID } from './constants';
import { ProposalExpandableRow } from './ProposalExpandableRow';
import { ProposalsDownloadAttachmentsButton } from './ProposalsDownloadAttachmentsButton';
import { ProposalsExportButton } from './ProposalsExportButton';
import { ProposalsListFilter } from './ProposalsListFilter';

interface RoundProposalsListProps {
  round: ProtectedRound;
  call: Call;
}

export const ProposalsList: FC<RoundProposalsListProps> = (props) => {
  const dispatch = useDispatch();
  const filterValues = useSelector(getFormValues(PROPOSALS_FILTER_FORM_ID)) as any;

  const filter = useMemo(() => {
    const baseFilter: any = { round: props.round.uuid };
    if (filterValues?.state && filterValues.state.length > 0) {
      // Extract the values from the multi-select options
      baseFilter.state = filterValues.state.map((option) => option.value);
    } else if (!filterValues) {
      // Apply default filter on initial load: show only submitted and in_review
      baseFilter.state = ['submitted', 'in_review'];
    }
    return baseFilter;
  }, [props.round.uuid, filterValues?.state]);

  const tableProps = useTable({
    table: 'RoundProposalsList',
    filter,
    fetchData: createFetcher(proposalProposalsList),
    queryField: 'name',
  });

  const columns: Column<Proposal>[] = [
    {
      title: translate('Name'),
      render: ({ row }) => (
        <Link
          state="call-management.proposal-details"
          params={{
            proposal_uuid: row.uuid,
            uuid: props.call.customer_uuid,
          }}
          label={row.name}
        />
      ),
      copyField: (row) => row.name,
      keys: ['name'],
      id: 'name',
      export: 'name',
    },
    {
      title: translate('ID'),
      render: ({ row }) => <span className="fw-semibold">{row.slug}</span>,
      className: 'text-nowrap',
      copyField: (row) => row.slug,
      keys: ['slug'],
      id: 'slug',
      export: 'slug',
    },
    {
      title: translate('By'),
      render: ({ row }) => <>{row.created_by_name || DASH_ESCAPE_CODE}</>,
      keys: ['created_by_name'],
      id: 'created_by',
      export: 'created_by_name',
      optional: true,
    },
    {
      title: translate('Created'),
      orderField: 'created',
      render: ({ row }) => <>{formatDateTime(row.created)}</>,
      keys: ['created'],
      id: 'created',
      export: (row) => formatDateTime(row.created),
      optional: true,
    },
    {
      title: translate('Submitted'),
      orderField: 'submitted_at',
      render: ({ row }) => (
        <>
          {row.submitted_at
            ? formatDateTime(row.submitted_at)
            : DASH_ESCAPE_CODE}
        </>
      ),
      keys: ['submitted_at'],
      id: 'submitted',
      export: (row) =>
        row.submitted_at
          ? formatDateTime(row.submitted_at)
          : DASH_ESCAPE_CODE,
    },
    {
      title: translate('State'),
      orderField: 'state',
      render: ({ row }) => <ProposalBadge state={row.state} />,
      keys: ['state'],
      filter: 'state',
      id: 'state',
      export: 'state',
    },
    {
      title: translate('UUID'),
      render: ({ row }) => <>{row.uuid}</>,
      optional: true,
      keys: ['uuid'],
      id: 'uuid',
      export: 'uuid',
    },
    {
      title: translate('Notes'),
      render: ({ row }) => {
        const count = (row.notes ?? []).length;
        return (
          <button
            className="btn btn-sm btn-light-primary btn-icon-text"
            onClick={() =>
              dispatch(
                openModalDialog(ProposalNotesDialog, {
                  resolve: { proposal: row, refetch: tableProps.fetch },
                  size: 'md',
                }),
              )
            }
          >
            <ChatTeardropTextIcon className="me-1" />
            {count}
          </button>
        );
      },
      keys: ['notes'],
      id: 'notes',
    },
  ];

  return (
    <Table
      {...tableProps}
      id="proposals"
      columns={columns}
      tableActions={
        <>
          <ProposalsDownloadAttachmentsButton roundUuid={props.round.uuid} />
          <ProposalsExportButton
            roundUuid={props.round.uuid}
            callUuid={props.call.uuid}
          />
        </>
      }
      filters={<ProposalsListFilter />}
      title={translate('Proposals')}
      verboseName={translate('Proposals')}
      hasQuery
      showPageSizeSelector
      hasOptionalColumns
      expandableRow={ProposalExpandableRow}
      rowActions={({ row }) => (
        <ProposalRowActions
          row={{
            ...row,
            call_uuid: props.call.uuid,
          }}
          refetch={tableProps.fetch}
        />
      )}
    />
  );
};
