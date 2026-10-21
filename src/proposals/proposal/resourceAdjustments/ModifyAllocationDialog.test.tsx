import { render, screen, waitFor } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { describe, expect, it, vi, beforeEach } from 'vitest';
import {
  proposalProposalsResourceAdjustmentsCreate,
  proposalProposalsResourceAdjustmentsDestroy,
} from 'waldur-js-client';

import { useModal } from '@/modal/actions';
import { renderWithProviders } from '@/test/harness';

import { ModifyAllocationDialog } from './ModifyAllocationDialog';

// The table machinery itself is exercised elsewhere (useTable.test.ts,
// Table.test.tsx) - here only the columns/tableActions/rowActions this
// dialog hands to it are under test, so both are stubbed and their props
// captured for direct inspection/invocation.
let tableProps: any;
vi.mock('@/table/Table', () => ({
  default: (props: any) => {
    tableProps = props;
    return null;
  },
}));
vi.mock('@/table/useTable', () => ({
  useTable: vi.fn(() => ({ rows: [], fetch: vi.fn() })),
}));

const proposal = { uuid: 'proposal-uuid', name: 'Test proposal' } as any;

const unmodifiedRow = {
  requested_resource_uuid: 'resource-uuid',
  offering_uuid: 'offering-uuid',
  offering_name: 'GPU cluster',
  original_attributes: { cpu: 2 },
  effective_attributes: { cpu: 2 },
  is_added: false,
  is_removed: false,
  has_modifications: false,
  adjustment: null,
} as any;

const modifiedRow = {
  ...unmodifiedRow,
  effective_attributes: { cpu: 8 },
  has_modifications: true,
  adjustment: { uuid: 'adjustment-uuid' },
} as any;

describe('ModifyAllocationDialog', () => {
  beforeEach(() => {
    tableProps = undefined;
    vi.clearAllMocks();
  });

  it('passes the proposal-scoped effective_allocation fetcher and renders the table shell', () => {
    renderWithProviders(
      <ModifyAllocationDialog resolve={{ proposal, refetch: vi.fn() }} />,
    );
    expect(tableProps).toBeDefined();
    expect(tableProps.columns).toHaveLength(3);
  });

  it('badges an added, a removed, and a modified row correctly, and leaves a plain row unbadged', () => {
    renderWithProviders(
      <ModifyAllocationDialog resolve={{ proposal, refetch: vi.fn() }} />,
    );
    const offeringColumn = tableProps.columns[0];

    const { unmount: unmountPlain } = render(
      offeringColumn.render({ row: unmodifiedRow }),
    );
    expect(screen.queryByText('Added')).not.toBeInTheDocument();
    expect(screen.queryByText('Removed')).not.toBeInTheDocument();
    expect(screen.queryByText('Modified')).not.toBeInTheDocument();
    unmountPlain();

    render(
      offeringColumn.render({
        row: { ...unmodifiedRow, is_added: true },
      }),
    );
    expect(screen.getByText('Added')).toBeInTheDocument();

    render(
      offeringColumn.render({
        row: { ...unmodifiedRow, is_removed: true },
      }),
    );
    expect(screen.getByText('Removed')).toBeInTheDocument();

    render(offeringColumn.render({ row: modifiedRow }));
    expect(screen.getByText('Modified')).toBeInTheDocument();
  });

  it("opens AddResourceAdjustmentDialog from the table actions, scoped to this table's own refetch", async () => {
    const user = userEvent.setup();
    renderWithProviders(
      <ModifyAllocationDialog resolve={{ proposal, refetch: vi.fn() }} />,
    );
    render(<>{tableProps.tableActions}</>);
    await user.click(screen.getByText('Add resource'));

    expect(useModal().openDialog).toHaveBeenCalledWith(
      expect.anything(),
      expect.objectContaining({
        resolve: expect.objectContaining({ proposal }),
      }),
    );
  });

  it('Remove calls the resource-adjustments endpoint with a remove action and does not close the dialog', async () => {
    const user = userEvent.setup();
    const refetch = vi.fn();
    vi.mocked(proposalProposalsResourceAdjustmentsCreate).mockResolvedValue({
      data: {},
    } as any);
    const { unmount: unmountDialog } = renderWithProviders(
      <ModifyAllocationDialog resolve={{ proposal, refetch: vi.fn() }} />,
    );
    // Only needed to populate tableProps above - leaving it mounted alongside
    // the row-actions render below would give two "Close"/toggle buttons.
    unmountDialog();

    renderWithProviders(
      <>{tableProps.rowActions({ row: unmodifiedRow, fetch: refetch })}</>,
    );
    await user.click(screen.getByRole('button'));
    await user.click(await screen.findByText('Remove'));

    await waitFor(() => {
      expect(proposalProposalsResourceAdjustmentsCreate).toHaveBeenCalledWith({
        path: { uuid: 'proposal-uuid' },
        body: { requested_resource: 'resource-uuid', action: 'remove' },
      });
    });
    expect(useModal().closeDialog).not.toHaveBeenCalled();
  });

  it('Undo on a modified row destroys the existing adjustment and does not close the dialog', async () => {
    const user = userEvent.setup();
    const refetch = vi.fn();
    vi.mocked(proposalProposalsResourceAdjustmentsDestroy).mockResolvedValue({
      data: {},
    } as any);
    const { unmount: unmountDialog } = renderWithProviders(
      <ModifyAllocationDialog resolve={{ proposal, refetch: vi.fn() }} />,
    );
    unmountDialog();

    renderWithProviders(
      <>{tableProps.rowActions({ row: modifiedRow, fetch: refetch })}</>,
    );
    await user.click(screen.getByRole('button'));
    await user.click(await screen.findByText('Undo'));

    await waitFor(() => {
      expect(proposalProposalsResourceAdjustmentsDestroy).toHaveBeenCalledWith({
        path: { uuid: 'proposal-uuid', obj_uuid: 'adjustment-uuid' },
      });
    });
    expect(useModal().closeDialog).not.toHaveBeenCalled();
  });

  it('offers Edit/Remove on an unmodified row but only Undo on a modified row', async () => {
    const user = userEvent.setup();
    const { unmount: unmountDialog } = renderWithProviders(
      <ModifyAllocationDialog resolve={{ proposal, refetch: vi.fn() }} />,
    );
    unmountDialog();

    const { unmount } = renderWithProviders(
      <>{tableProps.rowActions({ row: unmodifiedRow, fetch: vi.fn() })}</>,
    );
    await user.click(screen.getByRole('button'));
    expect(await screen.findByText('Edit')).toBeInTheDocument();
    expect(screen.getByText('Remove')).toBeInTheDocument();
    unmount();

    renderWithProviders(
      <>{tableProps.rowActions({ row: modifiedRow, fetch: vi.fn() })}</>,
    );
    await user.click(screen.getByRole('button'));
    expect(await screen.findByText('Undo')).toBeInTheDocument();
    expect(screen.queryByText('Remove')).not.toBeInTheDocument();
  });
});
