import { ChatTeardropTextIcon } from '@phosphor-icons/react';
import { useMutation } from '@tanstack/react-query';
import { FC, useEffect, useRef, useState } from 'react';
import { Button, Form } from 'react-bootstrap';
import { useDispatch } from 'react-redux';
import {
  openportalManagedProjectsAddNote,
  openportalManagedProjectsRetrieveGet,
} from 'waldur-js-client';

import { formatDateTime } from '@waldur/core/dateUtils';
import { LoadingSpinnerIcon } from '@waldur/core/LoadingSpinner';
import { translate } from '@waldur/i18n';
import { ModalDialog } from '@waldur/modal/ModalDialog';
import { showErrorResponse, showSuccess } from '@waldur/store/notify';

import type { AwardDetails } from '../bindings/AwardDetails';
import type { Note } from '../bindings/Note';

interface Props {
  resolve: {
    row: any;
    refetch(): void;
  };
}

export const ManagedProjectNotesDialog: FC<Props> = ({ resolve }) => {
  const dispatch = useDispatch();
  const [row, setRow] = useState(resolve.row);
  const [text, setText] = useState('');
  const scrollRef = useRef<HTMLDivElement>(null);

  const notes: Note[] = ((row.details as AwardDetails).notes ?? []);

  const scrollToBottom = () => {
    if (scrollRef.current)
      scrollRef.current.scrollTop = scrollRef.current.scrollHeight;
  };

  useEffect(() => {
    scrollToBottom();
  }, [notes.length]);

  const { mutate, isPending } = useMutation({
    mutationFn: () =>
      openportalManagedProjectsAddNote({
        path: { identifier: row.identifier, destination: row.destination },
        body: { text },
      }),
    onSuccess: async () => {
      setText('');
      dispatch(showSuccess(translate('Note added.')));
      const response = await openportalManagedProjectsRetrieveGet({
        path: { identifier: row.identifier, destination: row.destination },
      });
      if (response.data) setRow(response.data);
      resolve.refetch();
    },
    onError: (error) =>
      dispatch(showErrorResponse(error, translate('Unable to add note.'))),
  });

  return (
    <ModalDialog
      title={translate('Notes — {name}', {
        name: (row.details as AwardDetails).name || row.identifier,
      })}
      iconNode={<ChatTeardropTextIcon weight="bold" />}
      closeButton
    >
      {notes.length > 0 ? (
        <div
          ref={scrollRef}
          style={{ maxHeight: 360, overflowY: 'auto' }}
          className="mb-3 pe-1"
        >
          {notes.map((note, i) => (
            <div key={i} className="border rounded p-2 mb-1 bg-light">
              <div className="d-flex justify-content-between align-items-baseline">
                <strong>{note.author}</strong>
                <small className="text-muted ms-2">
                  {formatDateTime(note.timestamp)}
                </small>
              </div>
              <div style={{ whiteSpace: 'pre-wrap' }}>{note.text}</div>
            </div>
          ))}
        </div>
      ) : (
        <div className="text-muted mb-3">{translate('No notes yet.')}</div>
      )}
      <Form
        onSubmit={(e) => {
          e.preventDefault();
          if (text.trim()) mutate();
        }}
      >
        <Form.Control
          as="textarea"
          rows={2}
          value={text}
          onChange={(e) => setText(e.target.value)}
          placeholder={translate('Add a note...')}
          className="mb-2"
          disabled={isPending}
        />
        <Button type="submit" size="sm" disabled={isPending || !text.trim()}>
          {isPending && <LoadingSpinnerIcon className="me-1" />}
          {translate('Add note')}
        </Button>
      </Form>
    </ModalDialog>
  );
};
