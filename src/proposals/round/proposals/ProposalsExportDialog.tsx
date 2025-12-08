import { FileXlsIcon } from '@phosphor-icons/react';
import { ChangeEvent, FC, useCallback, useState } from 'react';
import { Button, Form, Spinner } from 'react-bootstrap';
import { useDispatch } from 'react-redux';
import {
  Proposal,
  proposalProposalsList,
  proposalProposalsListUsersList,
  proposalProposalsResourcesList,
} from 'waldur-js-client';

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
  callUuid: string;
}

interface ProposalWithDetails extends Proposal {
  users?: any[];
  resources?: any[];
}

export const ProposalsExportDialog: FC<ProposalsExportDialogProps> = ({
  roundUuid,
  callUuid,
}) => {
  const dispatch = useDispatch();
  const { showError, showSuccess } = useNotify();
  const [selectedStates, setSelectedStates] = useState<Set<ProposalState>>(
    new Set(['in_review']),
  );
  const [includeProjectDetails, setIncludeProjectDetails] = useState(false);
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
      const allProposals: ProposalWithDetails[] = [];

      for (const state of selectedStates) {
        try {
          const response = await proposalProposalsList({
            query: {
              round: roundUuid,
              state: state,
              page_size: 1000, // Get all proposals
            },
          });

          // The response.data is an array of proposals
          if (response.data && Array.isArray(response.data)) {
            // Fetch users and resources for each proposal
            for (const proposal of response.data) {
              try {
                // Fetch team members
                const usersResponse = await proposalProposalsListUsersList({
                  path: { uuid: proposal.uuid },
                  query: { page_size: 1000 },
                });

                // Fetch resources
                const resourcesResponse =
                  await proposalProposalsResourcesList({
                    path: { uuid: proposal.uuid },
                    query: { page_size: 1000 },
                  });

                allProposals.push({
                  ...proposal,
                  users: usersResponse.data || [],
                  resources: resourcesResponse.data || [],
                });
              } catch (error) {
                console.error(
                  `Error fetching details for proposal ${proposal.slug}:`,
                  error,
                );
                // Add proposal without details if fetching fails
                allProposals.push(proposal);
              }
            }
          }
        } catch (error) {
          console.error(`Error fetching proposals for state ${state}:`, error);
          showError(
            translate('Error fetching proposals for state {state}', { state }),
          );
        }
      }

      if (allProposals.length === 0) {
        showError(translate('No proposals found for the selected states'));
        setIsExporting(false);
        return;
      }

      // Prepare export data fields
      const fields = [
        translate('Proposal ID'),
        translate('URL'),
        translate('Name'),
        translate('Description'),
        translate('State'),
        translate('Created by'),
        translate('Created'),
      ];

      // Add project fields if checkbox is selected
      if (includeProjectDetails) {
        fields.push(
          translate('Project name'),
          translate('Project URL'),
        );
      }

      fields.push(
        translate('Project summary'),
        translate('Duration (days)'),
        translate('Confidential'),
        translate('Research only'),
        translate('Requested resources'),
        translate('Team members'),
      );

      // Prepare export data
      const exportData: ExportData = {
        fields,
        data: allProposals.map((proposal) => {
          const row: any[] = [
            proposal.slug,
            `${window.location.origin}/call-management/${callUuid}/proposals/${proposal.uuid}/`,
            proposal.name,
            proposal.description || '',
            proposal.state,
            proposal.project_summary || '',
            proposal.duration_in_days?.toString() || '',
            proposal.project_is_confidential ? 'Yes' : 'No',
            proposal.project_has_civilian_purpose ? 'Yes' : 'No',
            proposal.resources
              ?.map((r) => r.requested_offering.offering_name)
              .join(':') || '',
            proposal.created_by_name,
            formatDateTime(proposal.created),
            proposal.users
              ?.map((u) => `${u.email} [${u.role || 'Member'}]`)
              .join(':') || '',
          ];

          // Add project details if checkbox is selected
          if (includeProjectDetails) {
            row.push(
              proposal.project_name || '',
              proposal.project
                ? `${window.location.origin}/projects/${proposal.project}/`
                : '',
            );
          }

          return row;
        }),
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
  }, [
    roundUuid,
    callUuid,
    selectedStates,
    includeProjectDetails,
    showError,
    showSuccess,
    dispatch,
  ]);

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
      <div className="d-flex flex-column gap-3 mb-4">
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
      <hr />
      <div className="mt-4">
        <Form.Check
          type="checkbox"
          id="include-project-details"
          label={translate('Include project details')}
          checked={includeProjectDetails}
          onChange={(e: ChangeEvent<HTMLInputElement>) =>
            setIncludeProjectDetails(e.target.checked)
          }
          disabled={isExporting}
        />
        <Form.Text className="text-muted ms-4">
          {translate(
            'Include the project name and URL (if the proposal has been accepted and a project has been created)',
          )}
        </Form.Text>
      </div>
    </ModalDialog>
  );
};
