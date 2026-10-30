import { screen, waitFor } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { beforeEach, describe, expect, it, vi } from 'vitest';
import { proposalProposalsReturnsList } from 'waldur-js-client';

import { useModal } from '@/modal/actions';
import { renderWithProviders } from '@/test/harness';
import { useUser } from '@/workspace/hooks';

import { ProposalReturnsSection } from './ProposalReturnsSection';
import { ReturnActions } from './ReturnActions';

// The table renders through the app's store; a stand-in renders its cells
// from the rows the section gives it.
vi.mock('@/table/useTable', async () => {
  const { useEffect, useState } = await import('react');
  return {
    useTable: ({ fetchData }) => {
      const [rows, setRows] = useState([]);
      useEffect(() => {
        fetchData().then((result) => setRows(result.rows));
      }, [fetchData]);
      return { rows };
    },
  };
});
vi.mock('@/table/Table', () => ({
  default: ({ columns, rows }) => (
    <ul>
      {(rows ?? []).map((row) => (
        <li key={row.uuid}>
          {columns.map((column) => (
            <span key={column.title}>{column.render({ row })}</span>
          ))}
        </li>
      ))}
    </ul>
  ),
}));

const proposal = (state: string): any => ({
  uuid: 'p-1',
  state,
  call_uuid: 'call-1',
  call_managing_organisation_uuid: 'org-1',
});

const ret = (overrides = {}): any => ({
  uuid: 'r-1',
  created: '2026-10-01T10:00:00Z',
  returned_by_name: 'Call Manager',
  reason: 'Please add a data management plan.',
  resubmit_by: new Date(Date.now() + 7 * 86_400_000).toISOString(),
  previous_state: 'in_review',
  resubmitted_at: null,
  is_open: true,
  workflow_history: null,
  ...overrides,
});

describe('ReturnActions', () => {
  beforeEach(() => {
    vi.clearAllMocks();
    vi.mocked(useUser).mockReturnValue({ is_staff: true } as any);
    vi.mocked(proposalProposalsReturnsList).mockResolvedValue({
      data: [ret()],
    } as any);
  });

  it('offers to return a submitted proposal', async () => {
    renderWithProviders(
      <ReturnActions proposal={proposal('submitted')} refetch={vi.fn()} />,
    );
    await userEvent.click(
      screen.getByRole('button', { name: 'Return to applicant' }),
    );
    expect(useModal().openDialog).toHaveBeenCalled();
    expect(
      screen.queryByRole('button', { name: 'Extend the deadline' }),
    ).not.toBeInTheDocument();
  });

  it('offers to extend the deadline of a returned draft', async () => {
    renderWithProviders(
      <ReturnActions proposal={proposal('draft')} refetch={vi.fn()} />,
    );
    expect(
      await screen.findByRole('button', { name: 'Extend the deadline' }),
    ).toBeInTheDocument();
    expect(
      screen.queryByRole('button', { name: 'Return to applicant' }),
    ).not.toBeInTheDocument();
  });

  it('offers nothing to someone who may not decide on proposals', () => {
    vi.mocked(useUser).mockReturnValue({
      is_staff: false,
      permissions: [],
    } as any);
    renderWithProviders(
      <ReturnActions proposal={proposal('submitted')} refetch={vi.fn()} />,
    );
    expect(screen.queryByRole('button')).not.toBeInTheDocument();
    expect(proposalProposalsReturnsList).not.toHaveBeenCalled();
  });
});

describe('ProposalReturnsSection', () => {
  beforeEach(() => vi.clearAllMocks());

  it('lists the returns, marking one past its deadline', async () => {
    vi.mocked(proposalProposalsReturnsList).mockResolvedValue({
      data: [
        ret({ resubmit_by: '2026-01-01T00:00:00Z' }),
        ret({
          uuid: 'r-0',
          is_open: false,
          reason: 'Budget unclear.',
          resubmitted_at: '2025-12-01T00:00:00Z',
        }),
      ],
    } as any);
    renderWithProviders(<ProposalReturnsSection proposalUuid="p-1" />);

    expect(
      await screen.findByText('Returned to the applicant'),
    ).toBeInTheDocument();
    expect(
      await screen.findByText('Please add a data management plan.'),
    ).toBeInTheDocument();
    expect(screen.getByText('Budget unclear.')).toBeInTheDocument();
    expect(screen.getByText('Overdue')).toBeInTheDocument();
  });

  it('shows nothing for a proposal never returned', async () => {
    vi.mocked(proposalProposalsReturnsList).mockResolvedValue({
      data: [],
    } as any);
    const { container } = renderWithProviders(
      <ProposalReturnsSection proposalUuid="p-1" />,
    );
    await waitFor(() =>
      expect(proposalProposalsReturnsList).toHaveBeenCalled(),
    );
    expect(container).toBeEmptyDOMElement();
  });
});
