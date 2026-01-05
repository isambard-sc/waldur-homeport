import { FC, useCallback, useState } from 'react';
import { Button } from 'react-bootstrap';
import { useDispatch } from 'react-redux';
import { broadcastMessagesDetachFile } from 'waldur-js-client';

import { lazyComponent } from '@waldur/core/lazyComponent';
import { translate } from '@waldur/i18n';
import { openModalDialog, waitForConfirmation } from '@waldur/modal/actions';
import { useNotify } from '@waldur/store/hooks';

import { BroadcastAttachmentItem } from './BroadcastAttachmentItem';
import { BroadcastAttachment } from './types';

const AddAttachmentDialog = lazyComponent(() =>
  import('./AddAttachmentDialog').then((module) => ({
    default: module.AddAttachmentDialog,
  })),
);

interface AttachmentsSectionProps {
  broadcastUuid: string;
  attachments: BroadcastAttachment[];
  onAttachmentsChange: (attachments: BroadcastAttachment[]) => void;
  readOnly?: boolean;
  state?: 'DRAFT' | 'SCHEDULED' | 'SENT';
}

export const AttachmentsSection: FC<AttachmentsSectionProps> = ({
  broadcastUuid,
  attachments,
  onAttachmentsChange,
  readOnly,
  state,
}) => {
  const dispatch = useDispatch();
  const { showSuccess, showErrorResponse } = useNotify();
  const [deletingAttachments, setDeletingAttachments] = useState<Set<string>>(
    new Set(),
  );

  const isSent = state === 'SENT';
  const canModify = !readOnly && !isSent;

  const handleAddAttachment = useCallback(() => {
    dispatch(
      openModalDialog(AddAttachmentDialog, {
        resolve: {
          broadcastUuid,
          onAttachmentAdded: (attachment: BroadcastAttachment) => {
            onAttachmentsChange([...attachments, attachment]);
          },
        },
      }),
    );
  }, [dispatch, broadcastUuid, attachments, onAttachmentsChange]);

  const handleDeleteAttachment = useCallback(
    async (attachment: BroadcastAttachment) => {
      try {
        await waitForConfirmation(
          dispatch,
          translate('Delete Attachment'),
          translate(
            'Are you sure you want to delete this attachment? This action cannot be undone.',
          ),
          { forDeletion: true },
        );
      } catch {
        return;
      }

      setDeletingAttachments((prev) => new Set(prev).add(attachment.uuid));

      try {
        await broadcastMessagesDetachFile({
          path: { uuid: broadcastUuid },
          body: { uuid: attachment.uuid },
        });

        onAttachmentsChange(
          attachments.filter((a) => a.uuid !== attachment.uuid),
        );
        showSuccess(translate('Attachment deleted successfully.'));
      } catch (e) {
        showErrorResponse(e, translate('Failed to delete attachment.'));
      } finally {
        setDeletingAttachments((prev) => {
          const next = new Set(prev);
          next.delete(attachment.uuid);
          return next;
        });
      }
    },
    [
      dispatch,
      broadcastUuid,
      attachments,
      onAttachmentsChange,
      showSuccess,
      showErrorResponse,
    ],
  );

  return (
    <div className="mb-7">
      <label className="form-label fw-bold fs-6">{translate('Attachments')}</label>

      {canModify && (
        <div className="mb-4">
          <Button variant="primary" size="sm" onClick={handleAddAttachment}>
            <i className="fa fa-plus me-2"></i>
            {translate('Add Attachment')}
          </Button>
        </div>
      )}

      {isSent && (
        <div className="alert alert-info mb-4">
          <i className="fa fa-info-circle me-2"></i>
          {translate(
            'This broadcast has been sent. Attachments cannot be modified.',
          )}
        </div>
      )}

      {attachments.length > 0 ? (
        <div className="border border-gray-300 rounded p-4">
          {attachments.map((attachment, index) => (
            <div key={attachment.uuid}>
              <BroadcastAttachmentItem
                attachment={attachment}
                onDelete={canModify ? handleDeleteAttachment : undefined}
                isDeleting={deletingAttachments.has(attachment.uuid)}
                readOnly={!canModify}
              />
              {index < attachments.length - 1 && <hr className="my-3" />}
            </div>
          ))}
        </div>
      ) : (
        <div className="border border-gray-300 border-dashed rounded p-6 text-center text-muted">
          <div className="mb-2">{translate('No attachments added yet')}</div>
          <div className="fs-7">
            {translate('Files will be shared as download links in the email')}
          </div>
        </div>
      )}
    </div>
  );
};
