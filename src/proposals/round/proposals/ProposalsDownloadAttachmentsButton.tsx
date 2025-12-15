import { FileArrowDownIcon } from '@phosphor-icons/react';
import { ChangeEvent, FC, useState } from 'react';
import { Button, Form, ProgressBar, Spinner } from 'react-bootstrap';
import { useDispatch } from 'react-redux';
import JSZip from 'jszip';
import {
  proposalProposalsList,
  Proposal,
} from 'waldur-js-client';

import { lazyComponent } from '@waldur/core/lazyComponent';
import { translate } from '@waldur/i18n';
import { closeModalDialog, openModalDialog } from '@waldur/modal/actions';
import { ModalDialog } from '@waldur/modal/ModalDialog';
import { ProposalState } from '@waldur/proposals/types';
import { getProposalStateOptions } from '@waldur/proposals/utils';
import { useNotify } from '@waldur/store/hooks';

interface ProposalsDownloadAttachmentsButtonProps {
  roundUuid: string;
}

interface DownloadAttachmentsDialogProps {
  resolve: {
    roundUuid: string;
  };
}

export const DownloadAttachmentsDialog: FC<DownloadAttachmentsDialogProps> = ({
  resolve: { roundUuid },
}) => {
  const dispatch = useDispatch();
  const { showError, showSuccess } = useNotify();
  const [selectedStates, setSelectedStates] = useState<Set<ProposalState>>(
    new Set(['in_review']),
  );
  const [isDownloading, setIsDownloading] = useState(false);
  const [downloadProgress, setDownloadProgress] = useState<{
    current: number;
    total: number;
  } | null>(null);

  const stateOptions = getProposalStateOptions();

  const toggleState = (state: ProposalState) => {
    const newStates = new Set(selectedStates);
    if (newStates.has(state)) {
      newStates.delete(state);
    } else {
      newStates.add(state);
    }
    setSelectedStates(newStates);
  };

  const handleDownload = async () => {
    if (selectedStates.size === 0) {
      showError(translate('Please select at least one proposal state'));
      return;
    }

    setIsDownloading(true);
    setDownloadProgress(null);
    try {
      // Fetch all proposals for the round with selected states
      const proposalsByState: Proposal[][] = [];

      for (const state of selectedStates) {
        try {
          const response = await proposalProposalsList({
            query: {
              round: roundUuid,
              state: state,
              page_size: 1000,
            },
          });
          if (response.data && Array.isArray(response.data)) {
            proposalsByState.push(response.data);
          }
        } catch (error) {
          console.error(`Error fetching proposals for state ${state}:`, error);
        }
      }

      const proposals = proposalsByState.flat();

      // Collect all attachments
      const attachments: Array<{
        url: string;
        proposalSlug: string;
        fileName: string;
      }> = [];

      for (const proposal of proposals) {
        if (proposal.supporting_documentation) {
          for (const doc of proposal.supporting_documentation) {
            if (doc.file) {
              const fileName = doc.file_name?.split('/').pop() || doc.file.split('/').pop() || 'document';
              attachments.push({
                url: doc.file,
                proposalSlug: proposal.slug,
                fileName,
              });
            }
          }
        }
      }

      if (attachments.length === 0) {
        showError(translate('No attachments found for proposals in this round'));
        setIsDownloading(false);
        dispatch(closeModalDialog());
        return;
      }

      // Create a zip file
      const zip = new JSZip();

      // Download all files and add to zip with progress tracking
      let downloadedCount = 0;
      const totalAttachments = attachments.length;

      for (const attachment of attachments) {
        downloadedCount++;
        setDownloadProgress({ current: downloadedCount, total: totalAttachments });

        try {
          const response = await fetch(attachment.url);
          if (!response.ok) {
            console.error(`Failed to download ${attachment.fileName}`);
            continue;
          }
          const blob = await response.blob();

          // Add file to zip with folder structure: proposal-slug/filename
          zip.file(`${attachment.proposalSlug}/${attachment.fileName}`, blob);
        } catch (error) {
          console.error(`Error downloading ${attachment.fileName}:`, error);
        }
      }

      if (downloadedCount === 0) {
        showError(translate('Failed to download any attachments'));
        setIsDownloading(false);
        dispatch(closeModalDialog());
        return;
      }

      // Generate zip file
      const zipBlob = await zip.generateAsync({ type: 'blob' });

      // Download zip file
      const url = URL.createObjectURL(zipBlob);
      const link = document.createElement('a');
      link.href = url;
      link.download = `proposal-attachments-${roundUuid}.zip`;
      document.body.appendChild(link);
      link.click();
      document.body.removeChild(link);
      URL.revokeObjectURL(url);

      showSuccess(
        translate('Downloaded {count} attachments', { count: downloadedCount }),
      );
      dispatch(closeModalDialog());
    } catch (error) {
      console.error('Error downloading attachments:', error);
      showError(translate('Failed to download attachments'));
    } finally {
      setIsDownloading(false);
      setDownloadProgress(null);
    }
  };

  return (
    <ModalDialog
      title={translate('Download attachments')}
      footer={
        <>
          <Button
            variant="secondary"
            onClick={() => dispatch(closeModalDialog())}
            disabled={isDownloading}
          >
            {translate('Cancel')}
          </Button>
          <Button
            variant="primary"
            disabled={selectedStates.size === 0 || isDownloading}
            onClick={handleDownload}
          >
            {isDownloading ? (
              <>
                <Spinner
                  as="span"
                  animation="border"
                  size="sm"
                  role="status"
                  aria-hidden="true"
                  className="me-2"
                />
                {translate('Downloading...')}
              </>
            ) : (
              <>
                <FileArrowDownIcon size={16} weight="bold" className="me-2" />
                {translate('Download')}
              </>
            )}
          </Button>
        </>
      }
    >
      <p className="text-muted mb-4">
        {translate(
          'Select the proposal states you want to include in the download:',
        )}
      </p>
      <div className="d-flex flex-column gap-3 mb-4">
        {stateOptions.map((option) => (
          <Form.Check
            key={option.value}
            type="checkbox"
            id={`state-${option.value}`}
            label={option.label}
            checked={selectedStates.has(option.value)}
            onChange={() => toggleState(option.value)}
            disabled={isDownloading}
          />
        ))}
      </div>
      {downloadProgress && (
        <div className="mt-4">
          <div className="d-flex justify-content-between align-items-center mb-2">
            <span className="text-muted">
              {translate('Downloading file {current} of {total}', {
                current: downloadProgress.current,
                total: downloadProgress.total,
              })}
            </span>
            <span className="text-muted">
              {Math.round((downloadProgress.current / downloadProgress.total) * 100)}%
            </span>
          </div>
          <ProgressBar
            now={(downloadProgress.current / downloadProgress.total) * 100}
            variant="primary"
            animated
          />
        </div>
      )}
    </ModalDialog>
  );
};

export const ProposalsDownloadAttachmentsButton: FC<
  ProposalsDownloadAttachmentsButtonProps
> = ({ roundUuid }) => {
  const dispatch = useDispatch();

  const handleClick = () => {
    dispatch(
      openModalDialog(DownloadAttachmentsDialog, {
        resolve: { roundUuid },
        size: 'md',
      }),
    );
  };

  return (
    <Button variant="secondary" onClick={handleClick} className="me-2">
      <FileArrowDownIcon size={16} weight="bold" className="me-2" />
      {translate('Download attachments')}
    </Button>
  );
};
