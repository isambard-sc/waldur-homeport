import { screen, waitFor } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { useSelector } from 'react-redux';
import { beforeEach, describe, expect, it, vi } from 'vitest';
import { formFlowsCheckRetrieve, formFlowsSync } from 'waldur-js-client';

import { useModal } from '@/modal/actions';
import { renderWithProviders } from '@/test/harness';

import { FormFlowCheckDialog } from './FormFlowCheckDialog';

vi.mock('react-redux', async (importOriginal) => ({
  ...(await importOriginal<typeof import('react-redux')>()),
  useSelector: vi.fn(),
}));

const flow: any = { uuid: 'flow-uuid', name: 'AIRR Gateway' };

const step = (overrides = {}) => ({
  key: 'compliance',
  survey_id: 's1',
  survey_name: 'Compliance survey',
  in_sync: false,
  changes: ['Add hidden field proposal'],
  problems: [],
  questions: [{ id: 'q1', type: 'openText', label: 'Who leads?', choices: [] }],
  ...overrides,
});

describe('FormFlowCheckDialog', () => {
  beforeEach(() => {
    vi.clearAllMocks();
    vi.mocked(useSelector).mockReturnValue(true);
  });

  it("shows each survey's changes, problems and questions", async () => {
    vi.mocked(formFlowsCheckRetrieve).mockResolvedValue({
      data: {
        in_sync: false,
        steps: [
          step(),
          step({
            key: 'team',
            survey_name: 'Team',
            changes: [],
            problems: ['The survey is closed.'],
          }),
        ],
      },
    } as any);
    renderWithProviders(<FormFlowCheckDialog resolve={{ flow }} />);

    expect(await screen.findByText('Compliance survey')).toBeInTheDocument();
    expect(screen.getByText('Add hidden field proposal')).toBeInTheDocument();
    expect(screen.getByText('The survey is closed.')).toBeInTheDocument();
    expect(screen.getAllByText('Who leads?')).toHaveLength(2);
    expect(formFlowsCheckRetrieve).toHaveBeenCalledWith({
      path: { uuid: 'flow-uuid' },
    });
  });

  it('syncs after confirming, then shows the new check', async () => {
    vi.mocked(formFlowsCheckRetrieve).mockResolvedValue({
      data: { in_sync: false, steps: [step()] },
    } as any);
    vi.mocked(formFlowsSync).mockResolvedValue({
      data: { in_sync: true, steps: [step({ in_sync: true, changes: [] })] },
    } as any);
    renderWithProviders(<FormFlowCheckDialog resolve={{ flow }} />);
    await userEvent.click(
      await screen.findByRole('button', { name: 'Sync surveys' }),
    );

    expect(useModal().confirm).toHaveBeenCalled();
    await waitFor(() =>
      expect(formFlowsSync).toHaveBeenCalledWith({
        path: { uuid: 'flow-uuid' },
      }),
    );
    expect(
      await screen.findByText('Every survey is ready for this flow.'),
    ).toBeInTheDocument();
  });

  it('leaves syncing to staff', async () => {
    vi.mocked(useSelector).mockReturnValue(false);
    vi.mocked(formFlowsCheckRetrieve).mockResolvedValue({
      data: { in_sync: false, steps: [step()] },
    } as any);
    renderWithProviders(<FormFlowCheckDialog resolve={{ flow }} />);
    await screen.findByText('Compliance survey');
    expect(
      screen.queryByRole('button', { name: 'Sync surveys' }),
    ).not.toBeInTheDocument();
  });
});
