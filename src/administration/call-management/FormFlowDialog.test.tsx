import { screen, waitFor } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { beforeEach, describe, expect, it, vi } from 'vitest';
import {
  formbricksSurveysList,
  formFlowsCreate,
  formFlowsUpdate,
} from 'waldur-js-client';

import { renderWithProviders } from '@/test/harness';

import { FormFlowDialog, toStepRequests } from './FormFlowDialog';
import { slugify, stepKeys } from './FormFlowStepsField';

const flow: any = {
  uuid: 'flow-uuid',
  key: 'airr-gw',
  name: 'AIRR Gateway',
  description: '',
  steps: [
    {
      key: 'project_details',
      label: 'Project details',
      survey_id: 's1',
      reviewer_visible: true,
    },
  ],
  calls_count: 0,
};

const surveys: any[] = [
  {
    id: 's1',
    name: 'Project details',
    status: 'inProgress',
    question_count: 4,
    used_by_flows: ['airr-gw'],
  },
  {
    id: 's2',
    name: 'Compliance',
    status: 'inProgress',
    question_count: 7,
    used_by_flows: [],
  },
];

describe('step keys', () => {
  it('slugs a label as Django does', () => {
    expect(slugify('Team & Compliance  Details!')).toBe(
      'team-compliance-details',
    );
    expect(slugify('Ünïcode')).toBe('unicode');
  });

  it("keeps a saved step's key and makes new ones unique", () => {
    expect(
      stepKeys([
        {
          key: 'compliance',
          label: 'Old',
          survey_id: 's1',
          reviewer_visible: true,
        },
        {
          key: '',
          label: 'Compliance',
          survey_id: 's2',
          reviewer_visible: true,
          isNew: true,
        },
        {
          key: '',
          label: 'Compliance',
          survey_id: 's3',
          reviewer_visible: false,
          isNew: true,
        },
      ]),
    ).toEqual(['compliance', 'compliance-2', 'compliance-3']);
  });

  it('sends only what the API takes', () => {
    expect(
      toStepRequests([
        {
          key: '',
          label: ' Team ',
          survey_id: 's2',
          reviewer_visible: false,
          isNew: true,
        },
      ]),
    ).toEqual([
      { key: 'team', label: 'Team', survey_id: 's2', reviewer_visible: false },
    ]);
  });
});

describe('FormFlowDialog', () => {
  beforeEach(() => {
    vi.clearAllMocks();
    vi.mocked(formbricksSurveysList).mockResolvedValue({
      data: surveys,
    } as any);
  });

  it('saves the edited flow with its steps', async () => {
    vi.mocked(formFlowsUpdate).mockResolvedValue({ data: flow } as any);
    renderWithProviders(<FormFlowDialog resolve={{ flow }} />);

    expect(await screen.findByText('Key: project_details')).toBeInTheDocument();
    await userEvent.click(screen.getByRole('button', { name: 'Save' }));

    await waitFor(() =>
      expect(formFlowsUpdate).toHaveBeenCalledWith({
        path: { uuid: 'flow-uuid' },
        body: {
          key: 'airr-gw',
          name: 'AIRR Gateway',
          description: '',
          purpose: 'application',
          steps: flow.steps,
        },
      }),
    );
  });

  it('asks for a survey on every step before saving', async () => {
    renderWithProviders(<FormFlowDialog resolve={{}} />);
    await userEvent.type(screen.getByLabelText(/^Name/), 'AIRR Gateway');
    await userEvent.type(screen.getByLabelText(/^Key/), 'airr-gw');
    await userEvent.type(screen.getByLabelText('Label'), 'Team');

    expect(screen.getByRole('button', { name: 'Save' })).toBeDisabled();
    expect(formFlowsCreate).not.toHaveBeenCalled();
  });

  it('removes a step, but never the last one', async () => {
    renderWithProviders(<FormFlowDialog resolve={{ flow }} />);
    await userEvent.click(screen.getByRole('button', { name: 'Add step' }));
    expect(screen.getAllByTestId('form-flow-step')).toHaveLength(2);

    await userEvent.click(
      screen.getAllByRole('button', { name: 'Remove step' })[1],
    );
    expect(screen.getAllByTestId('form-flow-step')).toHaveLength(1);
    expect(screen.getByRole('button', { name: 'Remove step' })).toBeDisabled();
  });

  it("shows the backend's reason for refusing the steps", async () => {
    vi.mocked(formFlowsUpdate).mockRejectedValue({
      status: 400,
      response: { status: 400 },
      steps: ["Step 'team': survey s9 is in another environment."],
    });
    renderWithProviders(<FormFlowDialog resolve={{ flow }} />);
    await userEvent.click(screen.getByRole('button', { name: 'Save' }));

    expect(
      await screen.findByText(
        "Step 'team': survey s9 is in another environment.",
      ),
    ).toBeInTheDocument();
  });
});

describe('FormFlowDialog purpose', () => {
  beforeEach(() => {
    vi.clearAllMocks();
    vi.mocked(formbricksSurveysList).mockResolvedValue({
      data: surveys,
    } as any);
  });

  it('keeps an end-of-project flow an end-of-project flow', async () => {
    vi.mocked(formFlowsUpdate).mockResolvedValue({ data: flow } as any);
    renderWithProviders(
      <FormFlowDialog resolve={{ flow: { ...flow, purpose: 'closing' } }} />,
    );
    await userEvent.click(screen.getByRole('button', { name: 'Save' }));
    await waitFor(() =>
      expect(formFlowsUpdate).toHaveBeenCalledWith(
        expect.objectContaining({
          body: expect.objectContaining({ purpose: 'closing' }),
        }),
      ),
    );
  });
});
