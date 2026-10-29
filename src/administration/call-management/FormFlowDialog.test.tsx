import { screen, waitFor } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { beforeEach, describe, expect, it, vi } from 'vitest';
import { formFlowsCreate, formFlowsUpdate } from 'waldur-js-client';

import { renderWithProviders } from '@/test/harness';

import { FormFlowDialog, parseSteps } from './FormFlowDialog';

// The editor is a Monaco instance in the browser; a textarea stands in for it.
vi.mock('@/form/MonacoField', () => ({
  MonacoField: ({ input }) => (
    <textarea
      aria-label="steps"
      value={input.value}
      onChange={(e) => input.onChange(e.target.value)}
    />
  ),
}));

const flow: any = {
  uuid: 'flow-uuid',
  key: 'airr-gw',
  name: 'AIRR Gateway',
  description: '',
  steps: [
    { key: 'project_details', label: 'Project details', survey_id: 's1' },
  ],
  calls_count: 0,
};

describe('parseSteps', () => {
  it('reads a list of steps', () => {
    expect(parseSteps('[{"key":"a"}]').steps).toEqual([{ key: 'a' }]);
  });

  it('explains JSON it cannot read', () => {
    expect(parseSteps('[{"key":').error).toMatch(/^Not valid JSON/);
  });

  it('wants at least one step', () => {
    expect(parseSteps('[]').error).toBe(
      'Steps must be a list of at least one step.',
    );
    expect(parseSteps('{"key":"a"}').error).toBe(
      'Steps must be a list of at least one step.',
    );
  });
});

describe('FormFlowDialog', () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  it('saves the edited flow with its steps as data, not text', async () => {
    vi.mocked(formFlowsUpdate).mockResolvedValue({ data: flow } as any);
    renderWithProviders(<FormFlowDialog resolve={{ flow }} />);

    await userEvent.click(screen.getByRole('button', { name: 'Save' }));

    await waitFor(() =>
      expect(formFlowsUpdate).toHaveBeenCalledWith({
        path: { uuid: 'flow-uuid' },
        body: {
          key: 'airr-gw',
          name: 'AIRR Gateway',
          description: '',
          steps: flow.steps,
        },
      }),
    );
  });

  it("shows the backend's reason under the steps", async () => {
    vi.mocked(formFlowsCreate).mockRejectedValue({
      status: 400,
      response: { status: 400 },
      steps: ["Step 'team': key must be a slug."],
    });
    renderWithProviders(<FormFlowDialog resolve={{}} />);

    await userEvent.type(screen.getByLabelText(/^Name/), 'AIRR Gateway');
    await userEvent.type(screen.getByLabelText(/^Key/), 'airr-gw');
    await userEvent.click(screen.getByRole('button', { name: 'Save' }));

    expect(
      await screen.findByText("Step 'team': key must be a slug."),
    ).toBeInTheDocument();
  });

  it('will not save steps that are not valid JSON', async () => {
    renderWithProviders(<FormFlowDialog resolve={{ flow }} />);
    const editor = screen.getByLabelText('steps');
    await userEvent.clear(editor);
    await userEvent.type(editor, '[[');

    expect(await screen.findByText(/^Not valid JSON/)).toBeInTheDocument();
    expect(screen.getByRole('button', { name: 'Save' })).toBeDisabled();
    expect(formFlowsUpdate).not.toHaveBeenCalled();
  });
});
