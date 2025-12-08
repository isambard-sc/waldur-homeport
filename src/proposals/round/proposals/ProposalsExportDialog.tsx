import { FileXlsIcon } from '@phosphor-icons/react';
import { ChangeEvent, FC, useCallback, useState } from 'react';
import { Button, Form, ProgressBar, Spinner } from 'react-bootstrap';
import { useDispatch } from 'react-redux';
import {
  Proposal,
  proposalProposalsList,
  proposalProposalsListUsersList,
  proposalProposalsResourcesList,
} from 'waldur-js-client';

import { ENV } from '@waldur/core/config';
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
  const [exportProgress, setExportProgress] = useState<{
    current: number;
    total: number;
  } | null>(null);

  const stateOptions = getProposalStateOptions();

  // Get role description from ENV.roles
  const getRoleDescription = (roleName: string): string => {
    const role = ENV.roles.find((role) => role.name === roleName);
    return role?.description || role?.name || roleName;
  };

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
    setExportProgress(null);
    try {
      // Fetch all proposals for the round with selected states
      const allProposals: ProposalWithDetails[] = [];

      // First pass: collect all proposals to determine total count
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
          showError(
            translate('Error fetching proposals for state {state}', { state }),
          );
        }
      }

      const totalProposals = proposalsByState.reduce((sum, proposals) => sum + proposals.length, 0);
      let processedCount = 0;

      // Second pass: fetch details for each proposal with progress tracking
      for (const proposals of proposalsByState) {
        for (const proposal of proposals) {
          processedCount++;
          setExportProgress({ current: processedCount, total: totalProposals });

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

      if (allProposals.length === 0) {
        showError(translate('No proposals found for the selected states'));
        setIsExporting(false);
        return;
      }

      // Calculate maximum number of attachments across all proposals
      const maxAttachments = Math.max(
        ...allProposals.map(
          (p) => p.supporting_documentation?.length || 0,
        ),
        0,
      );

      // Prepare export data fields
      const fields = [
        translate('Proposal'),
        translate('Name'),
        translate('Summary'),
        translate('Description'),
        translate('State'),
        translate('Requested resources'),
        translate('Duration (days)'),
        translate('Confidential'),
        translate('Research only'),
        translate('Created by'),
        translate('Created'),
        translate('Team members'),
      ];

      // Add attachment columns
      for (let i = 1; i <= maxAttachments; i++) {
        fields.push(translate('Attachment {index}', { index: i }));
      }

      // Add project field at the end if checkbox is selected
      if (includeProjectDetails) {
        fields.push(translate('Project'));
      }

      // Prepare export data
      const exportData: ExportData = {
        fields,
        data: allProposals.map((proposal) => {
          let projectUuid = '';
          if (proposal.project) {
            const match = proposal.project.match(/\/projects\/([^/]+)\//);
            if (match) {
              projectUuid = match[1];
            }
          }

          const proposalUrl = `${window.location.origin}/proposals/${proposal.uuid}/`;
          const projectUrl = projectUuid
            ? `${window.location.origin}/projects/${projectUuid}/`
            : '';

          const row: any[] = [
            { formula: `HYPERLINK("${proposalUrl}","${proposal.slug}")` },
            proposal.name,
            proposal.project_summary || '',
            proposal.description || '',
            proposal.state,
            proposal.resources
              ?.map((r) => r.requested_offering.offering_name)
              .join(':') || '',
            proposal.duration_in_days ?? '',
            proposal.project_is_confidential ? 'Yes' : 'No',
            proposal.project_has_civilian_purpose ? 'Yes' : 'No',
            proposal.created_by_name,
            formatDateTime(proposal.created),
            proposal.users
              ?.map(
                (u) =>
                  `${u.user_email || 'Unknown'} [${getRoleDescription(u.role_name) || 'Member'}]`,
              )
              .join(':') || '',
          ];

          // Add attachment URLs
          for (let i = 0; i < maxAttachments; i++) {
            const attachment = proposal.supporting_documentation?.[i];
            if (attachment && attachment.file) {
              // Extract filename from file path
              const filename =
                attachment.file_name.split('/').pop() ||
                attachment.file.split('/').pop() ||
                'Download';
              // Create clickable hyperlink for attachment
              row.push({
                formula: `HYPERLINK("${attachment.file}","${filename}")`,
              });
            } else {
              row.push('');
            }
          }

          // Add project details at the end if checkbox is selected
          if (includeProjectDetails) {
            if (projectUrl && proposal.project_name) {
              row.push({
                formula: `HYPERLINK("${projectUrl}","${proposal.project_name}")`,
              });
            } else {
              row.push(proposal.project_name || '');
            }
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
      setExportProgress(null);
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
      {exportProgress && (
        <div className="mt-4">
          <div className="d-flex justify-content-between align-items-center mb-2">
            <span className="text-muted">
              {translate('Downloading proposal {current} of {total}', {
                current: exportProgress.current,
                total: exportProgress.total,
              })}
            </span>
            <span className="text-muted">
              {Math.round((exportProgress.current / exportProgress.total) * 100)}%
            </span>
          </div>
          <ProgressBar
            now={(exportProgress.current / exportProgress.total) * 100}
            variant="primary"
            animated
          />
        </div>
      )}
    </ModalDialog>
  );
};
