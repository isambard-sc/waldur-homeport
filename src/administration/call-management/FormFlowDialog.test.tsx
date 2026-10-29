import { screen, waitFor } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { beforeEach, describe, expect, it, vi } from 'vitest';
import { formFlowsCreate, formFlowsUpdate } from 'waldur-js-client';

import { renderWithProviders } from '@/test/harness';

import {
  FormFlowDialog,
  parseSteps,
  SURVEY_ID_PLACEHOLDER,
} from './FormFlowDialog';

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
    expect(parseSteps('[{"key":"a","survey_id":"s1"}]').steps).toEqual([
      { key: 'a', survey_id: 's1' },
    ]);
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

describe('parseSteps survey IDs', () => {
  const step = (survey_id: unknown) =>
    JSON.stringify([
      { key: 'project_details', label: 'Project details', survey_id },
    ]);

  it('asks for the survey ID when it is empty, and says where to find it', () => {
    expect(parseSteps(step('')).error).toMatch(
      /^Step 'project_details' needs the ID of its Formbricks survey\..*after \/surveys\//,
    );
  });

  it('does not take the placeholder for an ID', () => {
    expect(parseSteps(step(SURVEY_ID_PLACEHOLDER)).error).toMatch(
      /needs the ID of its Formbricks survey/,
    );
  });

  it('wants one on every step', () => {
    expect(parseSteps(step(undefined)).error).toMatch(/needs the ID/);
  });

  it('accepts a real ID', () => {
    expect(parseSteps(step('cmt4q1c400004qe01zta9vmnm')).error).toBeUndefined();
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
    const editor = screen.getByLabelText('steps');
    await userEvent.clear(editor);
    // Pasted, not typed: typing reads [ and { as key names.
    await userEvent.paste('[{"key":"team","survey_id":"s1"}]');
    await userEvent.click(screen.getByRole('button', { name: 'Save' }));

    expect(
      await screen.findByText("Step 'team': key must be a slug."),
    ).toBeInTheDocument();
  });

  it('starts a new flow with a placeholder survey ID it will not save', () => {
    renderWithProviders(<FormFlowDialog resolve={{}} />);
    expect(
      (screen.getByLabelText('steps') as HTMLTextAreaElement).value,
    ).toContain(SURVEY_ID_PLACEHOLDER);
    expect(
      screen.getByText(/needs the ID of its Formbricks survey/),
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
