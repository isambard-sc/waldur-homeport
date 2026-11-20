import { useEffect, useRef } from 'react';
import { Form } from 'react-final-form';
import {
  ManagedProject,
  openportalManagedProjectsAddNote,
} from 'waldur-js-client';

import { formatDateTime } from '@/core/dateUtils';
import { required } from '@/core/validators';
import { SubmitButton, TextGroup } from '@/form';
import { translate } from '@/i18n';
import { useManagedMutation } from '@/modal/useManagedMutation';

interface FormValues {
  text: string;
}

interface ManagedProjectNotesProps {
  project: Pick<ManagedProject, 'identifier' | 'destination' | 'details'>;
  /** Reloads the project, so the new note joins the thread. */
  refetch(): void | Promise<unknown>;
  /** Height of the thread before it scrolls. */
  maxHeight?: number;
}

/**
 * The notes on an award and a box to add one.
 *
 * A note is not only kept here: add-note sends it back to the portal that made
 * the award, so this is how a reviewer talks to the awarding side.
 */
export const ManagedProjectNotes = ({
  project,
  refetch,
  maxHeight = 360,
}: ManagedProjectNotesProps) => {
  const notes = project.details?.notes ?? [];
  const threadRef = useRef<HTMLDivElement>(null);

  // Newest at the bottom, like a conversation, and kept in view as notes
  // arrive.
  useEffect(() => {
    if (threadRef.current) {
      threadRef.current.scrollTop = threadRef.current.scrollHeight;
    }
  }, [notes.length]);

  const addNote = useManagedMutation<unknown, unknown, FormValues>({
    mutationFn: (values) =>
      openportalManagedProjectsAddNote({
        path: {
          identifier: project.identifier,
          destination: project.destination,
        },
        body: { text: values.text },
      }),
    successMessage: translate('Note has been added.'),
    errorMessage: translate('Unable to add note.'),
    refetch: async () => {
      await refetch();
    },
    // Used on pages and in expandable rows as well as in the notes dialog,
    // which also stays open so the thread can be followed.
    closeModal: false,
  });

  return (
    <>
      {notes.length > 0 ? (
        <div
          ref={threadRef}
          className="d-flex flex-column gap-2 mb-3 pe-1"
          style={{ maxHeight, overflowY: 'auto' }}
        >
          {notes.map((note, index) => (
            <div key={index} className="border rounded p-3">
              <div className="d-flex justify-content-between gap-2 text-muted small">
                <span className="fw-semibold">{note.author}</span>
                <span>{formatDateTime(note.timestamp)}</span>
              </div>
              <div style={{ whiteSpace: 'pre-wrap', wordBreak: 'break-word' }}>
                {note.text}
              </div>
            </div>
          ))}
        </div>
      ) : (
        <p className="text-muted mb-3">{translate('No notes yet.')}</p>
      )}
      <Form<FormValues>
        onSubmit={async (values, form) => {
          await addNote.mutateAsync(values);
          // restart rather than reset, so the emptied box is not flagged as
          // a required field left blank.
          form.restart();
        }}
        subscription={{ submitting: true, invalid: true }}
        render={({ handleSubmit, submitting, invalid }) => (
          <form onSubmit={handleSubmit} noValidate>
            <TextGroup
              name="text"
              label={translate('New note')}
              placeholder={translate('Add a note for the awarding portal...')}
              validate={required}
              rows={3}
            />
            <SubmitButton
              submitting={submitting}
              invalid={invalid}
              disabledReason={
                invalid ? translate('Write a note to add.') : undefined
              }
              label={translate('Add note')}
            />
          </form>
        )}
      />
    </>
  );
};
