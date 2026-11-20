import { screen, waitFor } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { beforeEach, describe, expect, it, vi } from 'vitest';
import { openportalManagedProjectsAddNote } from 'waldur-js-client';

import { ModalProvider } from '@/modal/ModalContext';
import { renderWithProviders } from '@/test/harness';

import { ManagedProjectNotes } from './ManagedProjectNotes';

const project: any = {
  identifier: 'award-42',
  destination: 'airr.brics.isambard-ai',
  details: {
    notes: [
      {
        author: 'Awarding portal',
        timestamp: '2026-10-20T09:00:00Z',
        text: 'Please confirm the start date.',
      },
    ],
  },
};

const renderNotes = (refetch = vi.fn()) =>
  renderWithProviders(
    <ModalProvider>
      <ManagedProjectNotes project={project} refetch={refetch} />
    </ModalProvider>,
  );

describe('ManagedProjectNotes', () => {
  beforeEach(() => {
    vi.clearAllMocks();
    vi.mocked(openportalManagedProjectsAddNote).mockResolvedValue({} as any);
  });

  it('shows the notes already on the award', () => {
    renderNotes();
    expect(
      screen.getByText('Please confirm the start date.'),
    ).toBeInTheDocument();
    expect(screen.getByText('Awarding portal')).toBeInTheDocument();
  });

  it('sends a new note to the awarding portal and reloads the award', async () => {
    const refetch = vi.fn();
    renderNotes(refetch);

    await userEvent.type(
      screen.getByRole('textbox'),
      'Start date confirmed for 1 November.',
    );
    await userEvent.click(screen.getByRole('button', { name: 'Add note' }));

    await waitFor(() =>
      expect(openportalManagedProjectsAddNote).toHaveBeenCalledWith({
        path: {
          identifier: 'award-42',
          destination: 'airr.brics.isambard-ai',
        },
        body: { text: 'Start date confirmed for 1 November.' },
      }),
    );
    await waitFor(() => expect(refetch).toHaveBeenCalled());
    // The box is emptied for the next note.
    await waitFor(() => expect(screen.getByRole('textbox')).toHaveValue(''));
  });

  it('does not send an empty note', () => {
    renderNotes();
    expect(screen.getByRole('button', { name: 'Add note' })).toBeDisabled();
  });
});
