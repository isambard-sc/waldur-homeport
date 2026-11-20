import { screen, waitFor } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { beforeEach, describe, expect, it, vi } from 'vitest';
import {
  proposalProtectedCallsImportReviewAssignments,
  proposalProtectedCallsRoundsList,
} from 'waldur-js-client';

import { useNotify } from '@/store/notify';
import { renderWithProviders } from '@/test/harness';

import { countRows, ImportAssignmentsDialog } from './ImportAssignmentsDialog';

// The table renders through the app's store; a stand-in lists its rows.
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
  default: ({ rows }) => (
    <ul>
      {(rows ?? []).map((row) => (
        <li key={row.line}>
          {row.proposal_id} {row.status} {row.detail}
        </li>
      ))}
    </ul>
  ),
}));

const row = (line: number, status: string, detail = '') => ({
  line,
  proposal_id: `PROP-00${line}`,
  reviewer_email: `r${line}@example.com`,
  proposal_name: 'P',
  reviewer_name: 'R',
  status,
  detail,
});

const call: any = { uuid: 'call-1', slug: 'call' };

describe('countRows', () => {
  it('counts each outcome', () => {
    expect(
      countRows([
        row(1, 'ready'),
        row(2, 'ready'),
        row(3, 'skipped'),
        row(4, 'error'),
      ] as any),
    ).toEqual({ ready: 2, created: 0, skipped: 1, error: 1 });
  });
});

describe('ImportAssignmentsDialog', () => {
  beforeEach(() => {
    vi.clearAllMocks();
    vi.mocked(proposalProtectedCallsRoundsList).mockResolvedValue({
      data: [{ uuid: 'round-1', name: 'Round 1' }],
    } as any);
  });

  it('checks the file, then imports the valid rows with the same file', async () => {
    vi.mocked(proposalProtectedCallsImportReviewAssignments)
      .mockResolvedValueOnce({
        data: [
          row(2, 'ready'),
          row(3, 'error', 'Not a reviewer of this call.'),
        ],
      } as any)
      .mockResolvedValueOnce({
        data: [
          row(2, 'created'),
          row(3, 'error', 'Not a reviewer of this call.'),
        ],
      } as any);
    const refetch = vi.fn();
    renderWithProviders(
      <ImportAssignmentsDialog
        resolve={{ call, roundUuid: 'round-1', refetch }}
      />,
    );
    const file = new File(['proposal_id,reviewer_email\n'], 'a.csv', {
      type: 'text/csv',
    });
    await userEvent.upload(screen.getByTestId('upload'), file);

    expect(
      await screen.findByText(/Not a reviewer of this call\./),
    ).toBeInTheDocument();
    expect(proposalProtectedCallsImportReviewAssignments).toHaveBeenCalledWith(
      expect.objectContaining({
        path: { uuid: 'call-1' },
        body: { round: 'round-1', file, apply: false },
      }),
    );

    await userEvent.click(
      screen.getByRole('button', { name: 'Import 1 assignment(s)' }),
    );
    await waitFor(() =>
      expect(
        proposalProtectedCallsImportReviewAssignments,
      ).toHaveBeenLastCalledWith(
        expect.objectContaining({
          body: { round: 'round-1', file, apply: true },
        }),
      ),
    );
    await waitFor(() =>
      expect(useNotify().showError).toHaveBeenCalledWith(
        '1 imported, 0 already existed, 1 failed.',
      ),
    );
    expect(refetch).toHaveBeenCalled();
  });

  it('has nothing to import until a file is checked', () => {
    renderWithProviders(
      <ImportAssignmentsDialog resolve={{ call, roundUuid: 'round-1' }} />,
    );
    expect(
      screen.getByRole('button', { name: 'Import 0 assignment(s)' }),
    ).toBeDisabled();
  });
});
