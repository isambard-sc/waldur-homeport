import { useCallback, useState } from 'react';
import { Modal } from 'react-bootstrap';
import { broadcastMessagesAttachFile } from 'waldur-js-client';

import { formDataOptions } from '@waldur/core/api';
import { format } from '@waldur/core/ErrorMessageFormatter';
import { LoadingSpinner } from '@waldur/core/LoadingSpinner';
import { SubmitButton } from '@waldur/form';
import { translate } from '@waldur/i18n';
import { CloseDialogButton } from '@waldur/modal/CloseDialogButton';
import { useModal } from '@waldur/modal/hooks';
import { ModalDialog } from '@waldur/modal/ModalDialog';
import { useNotify } from '@waldur/store/hooks';

import { BroadcastAttachment } from './types';

interface AddAttachmentDialogProps {
  resolve: {
    broadcastUuid: string;
    onAttachmentAdded: (attachment: BroadcastAttachment) => void;
  };
}

export const AddAttachmentDialog = ({
  resolve: { broadcastUuid, onAttachmentAdded },
}: AddAttachmentDialogProps) => {
  const { showSuccess, showErrorResponse } = useNotify();
  const { closeDialog } = useModal();

  const [selectedFile, setSelectedFile] = useState<File | null>(null);
  const [uploading, setUploading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const handleFileSelect = (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    if (file) {
      setSelectedFile(file);
      setError(null);
    }
  };

  const handleDrop = (event: React.DragEvent<HTMLDivElement>) => {
    event.preventDefault();
    const file = event.dataTransfer.files?.[0];
    if (file) {
      setSelectedFile(file);
      setError(null);
    }
  };

  const handleDragOver = (event: React.DragEvent<HTMLDivElement>) => {
    event.preventDefault();
  };

  const handleUpload = useCallback(async () => {
    if (!selectedFile) return;

    setUploading(true);
    setError(null);

    try {
      const result = await broadcastMessagesAttachFile({
        path: { uuid: broadcastUuid },
        body: { file: selectedFile } as any,
        ...formDataOptions,
      });

      showSuccess(translate('Attachment added successfully.'));
      onAttachmentAdded(result.data);
      closeDialog();
    } catch (e) {
      const errorMessage = format(e);
      setError(errorMessage);
      showErrorResponse(e, translate('Failed to upload attachment.'));
    } finally {
      setUploading(false);
    }
  }, [selectedFile, broadcastUuid, onAttachmentAdded, closeDialog, showSuccess, showErrorResponse]);

  const formatFileSize = (bytes: number): string => {
    if (bytes >= 1024 * 1024) {
      return `${(bytes / (1024 * 1024)).toFixed(2)} MB`;
    } else if (bytes >= 1024) {
      return `${(bytes / 1024).toFixed(2)} KB`;
    } else {
      return `${bytes} bytes`;
    }
  };

  return (
    <ModalDialog
      title={translate('Add Attachment')}
      footer={
        <>
          <CloseDialogButton />
          <SubmitButton
            submitting={uploading}
            disabled={!selectedFile || uploading}
            label={translate('Upload')}
            onClick={handleUpload}
          />
        </>
      }
    >
      <Modal.Body>
        <div
          className="border border-2 border-dashed rounded p-10 text-center mb-4"
          onDrop={handleDrop}
          onDragOver={handleDragOver}
          style={{ minHeight: '150px', position: 'relative' }}
        >
          {uploading ? (
            <LoadingSpinner />
          ) : (
            <>
              <div className="text-gray-600 mb-3">
                {translate('Drag & drop file here')}
              </div>
              <div className="text-gray-600 mb-3">{translate('or')}</div>
              <label className="btn btn-sm btn-primary cursor-pointer">
                {translate('Choose File')}
                <input
                  type="file"
                  className="d-none"
                  onChange={handleFileSelect}
                  disabled={uploading}
                />
              </label>
            </>
          )}
        </div>

        {selectedFile && (
          <div className="alert alert-secondary mb-4">
            <strong>{translate('Selected file:')}</strong> {selectedFile.name} (
            {formatFileSize(selectedFile.size)})
          </div>
        )}

        {error && (
          <div className="alert alert-danger mb-4">
            {error}
          </div>
        )}

        <div className="alert alert-info mb-0">
          <i className="fa fa-info-circle me-2"></i>
          {translate('Recipients will receive a download link in the email')}
        </div>
      </Modal.Body>
    </ModalDialog>
  );
};
