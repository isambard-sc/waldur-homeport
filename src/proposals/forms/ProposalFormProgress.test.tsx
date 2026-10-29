import { screen, waitFor } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { beforeEach, describe, expect, it, vi } from 'vitest';
import {
  ProposalForm,
  proposalFormsEditLinkRetrieve,
  proposalProposalsSubmit,
} from 'waldur-js-client';

import { useModal } from '@/modal/actions';
import { renderWithProviders } from '@/test/harness';

import { ProposalFormProgress } from './ProposalFormProgress';

// The page's other sections fetch for themselves and are tested elsewhere.
vi.mock('@/proposals/proposal/create/ResourceRequestsSummary', () => ({
  ResourceRequestsSummary: () => null,
}));
vi.mock('@/proposals/team/TeamSection', () => ({ TeamSection: () => null }));

const proposal: any = { uuid: 'p-1', state: 'draft' };

const steps = (answered: number) =>
  [
    { key: 'project_details', label: 'Project details' },
    { key: 'team_details', label: 'Team details' },
  ].map((step, index) => ({
    ...step,
    completed: index < answered,
    submitted_at: index < answered ? '2026-10-28T10:00:00Z' : null,
  }));

const form = (overrides: Partial<ProposalForm> = {}): ProposalForm => ({
  proposal_uuid: 'p-1',
  flow_key: 'airr-gw',
  flow_name: 'AIRR Gateway',
  can_fill_in: true,
  steps: steps(0),
  next_step: {
    step_key: 'project_details',
    step_label: 'Project details',
    survey_url: 'https://forms.example.org/s/one',
  },
  responses: [],
  ...overrides,
});

const renderProgress = (f: ProposalForm, canSubmit = true) =>
  renderWithProviders(
    <ProposalFormProgress proposal={proposal} form={f} canSubmit={canSubmit} />,
  );

describe('ProposalFormProgress', () => {
  beforeEach(() => {
    vi.clearAllMocks();
    vi.spyOn(window.location, 'assign').mockImplementation(() => {});
  });

  it('starts with the first survey', async () => {
    renderProgress(form());
    await userEvent.click(
      screen.getByRole('button', { name: 'Start: Project details' }),
    );
    expect(window.location.assign).toHaveBeenCalledWith(
      'https://forms.example.org/s/one',
    );
  });

  it('continues with the next unanswered step', () => {
    renderProgress(
      form({
        steps: steps(1),
        next_step: {
          step_key: 'team_details',
          step_label: 'Team details',
          survey_url: 'https://forms.example.org/s/two',
        },
      }),
    );
    expect(
      screen.getByRole('button', { name: 'Continue: Team details' }),
    ).toBeInTheDocument();
    expect(screen.queryByRole('button', { name: 'Submit' })).toBeNull();
  });

  it('opens an answered step again to change it', async () => {
    vi.mocked(proposalFormsEditLinkRetrieve).mockResolvedValue({
      data: {
        step_key: 'project_details',
        step_label: 'Project details',
        survey_url: 'https://forms.example.org/s/one?prefilled',
      },
    } as any);
    renderProgress(form({ steps: steps(1) }));

    await userEvent.click(
      screen.getByRole('button', { name: 'Edit Project details' }),
    );
    expect(proposalFormsEditLinkRetrieve).toHaveBeenCalledWith({
      path: { uuid: 'p-1' },
      query: { step: 'project_details' },
    });
    await waitFor(() =>
      expect(window.location.assign).toHaveBeenCalledWith(
        'https://forms.example.org/s/one?prefilled',
      ),
    );
  });

  it('submits, once confirmed, when every step is answered', async () => {
    vi.mocked(useModal().confirm).mockResolvedValue(undefined);
    vi.mocked(proposalProposalsSubmit).mockResolvedValue({} as any);
    renderProgress(form({ steps: steps(2), next_step: null }));

    await userEvent.click(screen.getByRole('button', { name: 'Submit' }));
    await waitFor(() =>
      expect(proposalProposalsSubmit).toHaveBeenCalledWith({
        path: { uuid: 'p-1' },
      }),
    );
  });

  it('leaves submitting to those who may', () => {
    renderProgress(form({ steps: steps(2), next_step: null }), false);
    expect(screen.queryByRole('button', { name: 'Submit' })).toBeNull();
    expect(
      screen.getByText(
        'Every step is answered. The proposal is submitted by its lead.',
      ),
    ).toBeInTheDocument();
  });

  it('says the form is unavailable while Formbricks is switched off', () => {
    renderProgress(form({ steps: steps(1), next_step: null }));
    expect(
      screen.getByText('The application form is unavailable'),
    ).toBeInTheDocument();
    expect(screen.queryByRole('button', { name: /^Edit/ })).toBeNull();
    expect(screen.queryByRole('button', { name: 'Submit' })).toBeNull();
  });
});
