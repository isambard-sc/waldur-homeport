import { screen, waitFor } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { beforeEach, describe, expect, it, vi } from 'vitest';
import {
  formFlowsList,
  proposalFormCallsRetrieve,
  proposalFormCallsUpdate,
} from 'waldur-js-client';

import { isFeatureVisible } from '@/features/connect';
import { EditFieldDialog } from '@/form/EditFieldDialog';
import FormTable from '@/form/FormTable';
import { useModal } from '@/modal/actions';
import { renderWithProviders } from '@/test/harness';
import { openAndSelectOption } from '@/test/select';

import { CallFormFlowField } from './CallFormFlowField';

vi.mock('@/features/connect', () => ({ isFeatureVisible: vi.fn() }));

const callFlow = (overrides = {}) => ({
  data: {
    call_uuid: 'call-uuid',
    flow: null,
    flow_key: null,
    flow_name: null,
    locked: false,
    ...overrides,
  },
});

const renderField = (refetch = vi.fn()) =>
  renderWithProviders(
    <FormTable>
      <CallFormFlowField callUuid="call-uuid" refetch={refetch} />
    </FormTable>,
  );

const openDialogAndChoose = async (option: string) => {
  const user = userEvent.setup();
  await waitFor(() =>
    expect(screen.getByTestId('edit-flow')).not.toBeDisabled(),
  );
  await user.click(screen.getByTestId('edit-flow'));
  const { openDialog } = useModal();
  const [, dialogProps] = vi.mocked(openDialog).mock.lastCall as any;
  renderWithProviders(<EditFieldDialog {...dialogProps} />);
  await openAndSelectOption(user, /^Application form/, option);
  await user.click(screen.getByRole('button', { name: 'Confirm' }));
};

describe('CallFormFlowField', () => {
  beforeEach(() => {
    vi.clearAllMocks();
    vi.mocked(isFeatureVisible).mockReturnValue(true);
    vi.mocked(proposalFormCallsRetrieve).mockResolvedValue(callFlow() as any);
    vi.mocked(formFlowsList).mockResolvedValue({
      data: [
        { uuid: 'flow-gw', key: 'airr-gw', name: 'AIRR Gateway' },
        { uuid: 'flow-ra', key: 'airr-ra', name: 'AIRR Rapid Access' },
      ],
      response: { headers: new Headers({ 'x-result-count': '2' }) },
    } as any);
    vi.mocked(proposalFormCallsUpdate).mockResolvedValue({ data: {} } as any);
  });

  it('shows nothing while the site has form flows switched off', () => {
    vi.mocked(isFeatureVisible).mockReturnValue(false);
    renderField();
    expect(screen.queryByText('Application form')).not.toBeInTheDocument();
    expect(proposalFormCallsRetrieve).not.toHaveBeenCalled();
  });

  it('shows the built-in form when the call has no flow', async () => {
    renderField();
    expect(
      await screen.findByText('Built-in proposal form'),
    ).toBeInTheDocument();
  });

  it("shows the name of the call's flow", async () => {
    vi.mocked(proposalFormCallsRetrieve).mockResolvedValue(
      callFlow({
        flow: 'flow-gw',
        flow_key: 'airr-gw',
        flow_name: 'AIRR Gateway',
      }) as any,
    );
    renderField();
    expect(await screen.findByText('AIRR Gateway')).toBeInTheDocument();
  });

  it('saves a chosen flow through the call form-flow endpoint', async () => {
    const refetch = vi.fn();
    renderField(refetch);
    await openDialogAndChoose('AIRR Rapid Access');
    await waitFor(() => {
      expect(proposalFormCallsUpdate).toHaveBeenCalledWith({
        path: { uuid: 'call-uuid' },
        body: { flow: 'flow-ra' },
      });
      expect(refetch).toHaveBeenCalled();
    });
  });

  it('saves going back to the built-in form', async () => {
    vi.mocked(proposalFormCallsRetrieve).mockResolvedValue(
      callFlow({
        flow: 'flow-gw',
        flow_key: 'airr-gw',
        flow_name: 'AIRR Gateway',
      }) as any,
    );
    renderField();
    await openDialogAndChoose('Built-in proposal form');
    await waitFor(() =>
      expect(proposalFormCallsUpdate).toHaveBeenCalledWith({
        path: { uuid: 'call-uuid' },
        body: { flow: null },
      }),
    );
  });

  it('cannot be changed once the call has proposals', async () => {
    vi.mocked(proposalFormCallsRetrieve).mockResolvedValue(
      callFlow({ locked: true }) as any,
    );
    renderField();
    await screen.findByText('Built-in proposal form');
    expect(screen.getByTestId('edit-flow')).toBeDisabled();
  });
});
