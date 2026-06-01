import { useMutation } from '@tanstack/react-query';
import { useRef, useEffect, useState } from 'react';
import { Button, Card, Form } from 'react-bootstrap';
import { useDispatch, useSelector } from 'react-redux';
import { proposalProposalsAddNote } from 'waldur-js-client';

import { formatDateTime } from '@waldur/core/dateUtils';
import { LoadingSpinnerIcon } from '@waldur/core/LoadingSpinner';
import { translate } from '@waldur/i18n';
import { showErrorResponse, showSuccess } from '@waldur/store/notify';
import { Proposal } from '@waldur/proposals/types';
import { getUser } from '@waldur/workspace/selectors';

interface ProposalNotesSectionProps {
  proposal: Proposal;
  refetch(): void;
}

export const ProposalNotesSection = ({
  proposal,
  refetch,
}: ProposalNotesSectionProps) => {
  const dispatch = useDispatch();
  const user = useSelector(getUser);
  const [text, setText] = useState('');
  const scrollRef = useRef<HTMLDivElement>(null);

  const notes = (proposal.notes ?? []) as Array<{
    timestamp: string;
    author: string;
    text: string;
  }>;

  const scrollToBottom = () => {
    if (scrollRef.current) {
      scrollRef.current.scrollTop = scrollRef.current.scrollHeight;
    }
  };

  useEffect(() => {
    scrollToBottom();
  }, []);

  const { mutate, isPending } = useMutation({
    mutationFn: () =>
      proposalProposalsAddNote({
        path: { uuid: proposal.uuid },
        body: { author: user?.full_name || user?.username || '', text },
      }),
    onSuccess: async () => {
      setText('');
      dispatch(showSuccess(translate('Note added.')));
      refetch();
    },
    onError: (error) =>
      dispatch(showErrorResponse(error, translate('Unable to add note.'))),
  });

  return (
    <Card id="proposal-notes" className="card-bordered mb-5">
      <Card.Header>
        <Card.Title>{translate('Notes')}</Card.Title>
      </Card.Header>
      <Card.Body>
        {notes.length > 0 ? (
          <div
            ref={scrollRef}
            style={{ maxHeight: 300, overflowY: 'auto' }}
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
                <div className="mt-1">{note.text}</div>
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
      </Card.Body>
    </Card>
  );
};
