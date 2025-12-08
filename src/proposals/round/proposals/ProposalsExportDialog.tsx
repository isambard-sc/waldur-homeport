import { FileXlsIcon } from '@phosphor-icons/react';
import { FC, useCallback, useState } from 'react';
import { Button, Form, Spinner } from 'react-bootstrap';
import { useDispatch } from 'react-redux';
import { Proposal, proposalProposalsList } from 'waldur-js-client';

import { formatDateTime } from '@waldur/core/dateUtils';
import { translate } from '@waldur/i18n';
import { closeModalDialog } from '@waldur/modal/actions';
import { ModalDialog } from '@waldur/modal/ModalDialog';
import { ProposalState } from '@waldur/proposals/types';
import { getProposalStateOptions } from '@waldur/proposals/utils';
import { useNotify } from '@waldur/store/hooks';
import exportAs from '@waldur/table/exporters';
import { ExportData } from '@waldur/table/exporters/types';

interface ProposalsExportDialogProps {
  roundUuid: string;
}

export const ProposalsExportDialog: FC<ProposalsExportDialogProps> = ({
  roundUuid,
}) => {
  const dispatch = useDispatch();
  const { showError, showSuccess } = useNotify();
  const [selectedStates, setSelectedStates] = useState<Set<ProposalState>>(
    new Set(['in_review']),
  );
  const [isExporting, setIsExporting] = useState(false);

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

  const handleExport = useCallback(async () => {
    if (selectedStates.size === 0) {
      showError(translate('Please select at least one proposal state'));
      return;
    }

    setIsExporting(true);
    try {
      // Fetch all proposals for the round with selected states
      const allProposals: Proposal[] = [];

      for (const state of selectedStates) {
        try {
          console.log('Fetching proposals for state:', state);
          const response = await proposalProposalsList({
            query: {
              round: roundUuid,
              state: state,
              page_size: 1000, // Get all proposals
            },
          });
          console.log('Response:', response);

          // The response.data is an array of proposals
          if (response.data && Array.isArray(response.data)) {
            console.log(`Found ${response.data.length} proposals for state ${state}`);
            allProposals.push(...response.data);
          }
        } catch (error) {
          console.error(`Error fetching proposals for state ${state}:`, error);
          showError(translate('Error fetching proposals for state {state}', { state }));
        }
      }

      console.log('Total proposals fetched:', allProposals.length);

      if (allProposals.length === 0) {
        showError(translate('No proposals found for the selected states'));
        setIsExporting(false);
        return;
      }

      // Prepare export data
      const exportData: ExportData = {
        fields: [
          translate('Proposal ID'),
          translate('URL'),
          translate('Name'),
          translate('State'),
          translate('Created by'),
          translate('Created'),
          translate('Project name'),
          translate('Call name'),
          translate('Description'),
        ],
        data: allProposals.map((proposal) => [
          proposal.slug,
          `${window.location.origin}/organizations/${proposal.call_managing_organisation_uuid}/calls/${proposal.call_uuid}/proposals/${proposal.uuid}`,
          proposal.name,
          proposal.state,
          proposal.created_by_name,
          formatDateTime(proposal.created),
          proposal.project_name,
          proposal.call_name,
          proposal.description || '',
        ]),
      };

      // Export to Excel
      await exportAs('excel', 'proposals', exportData);
      showSuccess(translate('Proposals exported successfully'));
      dispatch(closeModalDialog());
    } catch (error) {
      console.error('Error exporting proposals:', error);
      showError(translate('Failed to export proposals'));
    } finally {
      setIsExporting(false);
    }
  }, [roundUuid, selectedStates, showError, showSuccess, dispatch]);

  return (
    <ModalDialog
      title={translate('Export proposals')}
      footer={
        <>
          <Button
            variant="secondary"
            onClick={() => dispatch(closeModalDialog())}
            disabled={isExporting}
          >
            {translate('Cancel')}
          </Button>
          <Button
            variant="primary"
            disabled={selectedStates.size === 0 || isExporting}
            onClick={handleExport}
          >
            {isExporting ? (
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
                <FileXlsIcon size={16} weight="bold" className="me-2" />
                {translate('Download')}
              </>
            )}
          </Button>
        </>
      }
    >
      <p className="text-muted mb-4">
        {translate(
          'Select the proposal states you want to include in the export:',
        )}
      </p>
      <div className="d-flex flex-column gap-3">
        {stateOptions.map((option) => (
          <Form.Check
            key={option.value}
            type="checkbox"
            id={`state-${option.value}`}
            label={option.label}
            checked={selectedStates.has(option.value)}
            onChange={() => toggleState(option.value)}
            disabled={isExporting}
          />
        ))}
      </div>
    </ModalDialog>
  );
};
