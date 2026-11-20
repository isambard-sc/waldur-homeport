import { useQuery } from '@tanstack/react-query';
import { FC } from 'react';
import { ProposalReturn, proposalProposalsReturnsList } from 'waldur-js-client';

import { Badge } from 'waldur-ui';

import { formatDateTime, formatDateTimeWithZone } from '@/core/dateUtils';
import { Panel } from '@/core/Panel';
import { translate } from '@/i18n';
import { getStepDefinitions } from '@/proposals/workflow/constants';
import Table from '@/table/Table';
import { Column } from '@/table/types';
import { useTable } from '@/table/useTable';
import { renderFieldOrDash } from '@/table/utils';

import { isOverdue, PROPOSAL_RETURNS_QUERY_KEY } from './permissions';

type HistoryEntry = ProposalReturn['workflow_history'][number];

const text = (value: unknown): string | null =>
  value === null || value === undefined || value === '' ? null : String(value);

const stepName = (step: unknown) =>
  getStepDefinitions().find((definition) => definition.id === step)?.name ??
  text(step);

const dateOrDash = (value: unknown) =>
  renderFieldOrDash(text(value) ? formatDateTime(String(value)) : null);

/** The workflow as it stood when the proposal was returned. */
const WorkflowHistoryTable: FC<{ row: ProposalReturn }> = ({ row }) => {
  const rows = row.workflow_history ?? [];
  const tableProps = useTable({
    table: `proposal-return-history-${row.uuid}`,
    fetchData: () => Promise.resolve({ rows, resultCount: rows.length }),
  });
  const columns: Column<HistoryEntry>[] = [
    {
      title: translate('Step'),
      render: ({ row: entry }) => renderFieldOrDash(stepName(entry.step)),
    },
    {
      title: translate('Status'),
      render: ({ row: entry }) => renderFieldOrDash(text(entry.status)),
    },
    {
      title: translate('Outcome'),
      render: ({ row: entry }) =>
        renderFieldOrDash(
          [text(entry.outcome), text(entry.outcome_reason)]
            .filter(Boolean)
            .join(': ') || null,
        ),
    },
    {
      title: translate('Completed'),
      render: ({ row: entry }) => dateOrDash(entry.completed_at),
    },
    {
      title: translate('Internal notes'),
      render: ({ row: entry }) => renderFieldOrDash(text(entry.internal_notes)),
    },
  ];
  return (
    <Table
      {...tableProps}
      columns={columns}
      verboseName={translate('workflow steps')}
      hideTitle
      hasActionBar={false}
      placeholderHasRetry={false}
    />
  );
};

const ResubmittedCell: FC<{ row: ProposalReturn }> = ({ row }) =>
  row.is_open ? (
    isOverdue(row.resubmit_by) ? (
      <Badge variant="danger" shape="pill">
        {translate('Overdue')}
      </Badge>
    ) : (
      <Badge variant="warning" shape="pill">
        {translate('Waiting for the applicant')}
      </Badge>
    )
  ) : (
    <>{dateOrDash(row.resubmitted_at)}</>
  );

/** The times a proposal was returned to its applicant, newest first. */
export const useProposalReturns = (proposalUuid: string, enabled = true) =>
  useQuery({
    queryKey: [PROPOSAL_RETURNS_QUERY_KEY, proposalUuid],
    queryFn: () =>
      proposalProposalsReturnsList({ path: { uuid: proposalUuid } }).then(
        (response) => response.data,
      ),
    enabled,
    refetchOnWindowFocus: false,
    meta: { skipGlobalErrorRedirect: true },
  });

const PREVIOUS_STATES: Record<string, () => string> = {
  submitted: () => translate('Submitted'),
  in_review: () => translate('In review'),
};

const ReturnsTable: FC<{ proposalUuid: string; rows: ProposalReturn[] }> = ({
  proposalUuid,
  rows,
}) => {
  const tableProps = useTable({
    table: `proposal-returns-${proposalUuid}`,
    fetchData: () => Promise.resolve({ rows, resultCount: rows.length }),
  });
  const hasHistory = rows.some((row) => row.workflow_history?.length);

  const columns: Column<ProposalReturn>[] = [
    {
      title: translate('Returned'),
      render: ({ row }) => formatDateTime(row.created),
    },
    {
      title: translate('By'),
      render: ({ row }) => renderFieldOrDash(row.returned_by_name),
    },
    {
      title: translate('Reason'),
      render: ({ row }) => <span className="text-pre-wrap">{row.reason}</span>,
    },
    {
      title: translate('Was'),
      render: ({ row }) =>
        PREVIOUS_STATES[row.previous_state]?.() ?? row.previous_state,
    },
    {
      title: translate('Resubmit by'),
      render: ({ row }) => formatDateTimeWithZone(row.resubmit_by),
    },
    {
      title: translate('Resubmitted'),
      render: ({ row }) => <ResubmittedCell row={row} />,
    },
  ];

  return (
    <Table
      {...tableProps}
      columns={columns}
      verboseName={translate('returns')}
      hideTitle
      hasActionBar={false}
      placeholderHasRetry={false}
      expandableRow={hasHistory ? WorkflowHistoryTable : undefined}
    />
  );
};

/**
 * The call team's record of a proposal's returns to its applicant: who, why,
 * the deadline, and whether it came back. Nothing at all for a proposal
 * never returned. Where the viewer may read internal notes, each return
 * expands to the workflow as it stood when it was returned.
 */
export const ProposalReturnsSection: FC<{ proposalUuid: string }> = ({
  proposalUuid,
}) => {
  const { data: returns, dataUpdatedAt } = useProposalReturns(proposalUuid);

  if (!returns?.length) {
    return null;
  }

  return (
    <Panel
      title={translate('Returned to the applicant')}
      cardBordered
      className="mb-7"
    >
      {/* Remounted when the returns change (a return, an extension): the
          table holds the rows it was given. */}
      <ReturnsTable
        key={dataUpdatedAt}
        proposalUuid={proposalUuid}
        rows={returns}
      />
    </Panel>
  );
};
