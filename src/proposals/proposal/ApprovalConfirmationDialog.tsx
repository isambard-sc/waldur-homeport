import { FC } from 'react';
import { Button } from 'react-bootstrap';
import { useDispatch } from 'react-redux';
import {
  EffectiveAllocationItem,
  Proposal,
  proposalProposalsApprove,
  proposalProposalsEffectiveAllocationList,
} from 'waldur-js-client';

import { translate } from '@waldur/i18n';
import { closeModalDialog } from '@waldur/modal/actions';
import { ModalDialog } from '@waldur/modal/ModalDialog';
import { showErrorResponse, showSuccess } from '@waldur/store/notify';
import { createFetcher } from '@waldur/table/api';
import Table from '@waldur/table/Table';
import { useTable } from '@waldur/table/useTable';

interface ApprovalConfirmationDialogProps {
  resolve: {
    proposal: Proposal;
    refetch: () => void;
  };
}

const formatLimits = (limits: unknown): string => {
  if (!limits || typeof limits !== 'object') return '-';
  const entries = Object.entries(limits as Record<string, number>);
  if (entries.length === 0) return '-';
  return entries.map(([key, value]) => `${key}: ${value}`).join(', ');
};

export const ApprovalConfirmationDialog: FC<ApprovalConfirmationDialogProps> = ({
  resolve: { proposal, refetch },
}) => {
  const dispatch = useDispatch();

  const tableProps = useTable({
    table: 'ApprovalEffectiveAllocationList',
    fetchData: createFetcher(proposalProposalsEffectiveAllocationList, {
      path: { uuid: proposal.uuid },
    }),
  });

  // Filter out removed resources for the approval view
  const activeResources = (tableProps.rows || []).filter(
    (row: EffectiveAllocationItem) => !row.is_removed,
  );

  const handleApprove = async () => {
    try {
      await proposalProposalsApprove({ path: { uuid: proposal.uuid } });
      dispatch(showSuccess(translate('Proposal has been approved.')));
      dispatch(closeModalDialog());
      refetch();
    } catch (error) {
      dispatch(
        showErrorResponse(error, translate('Unable to approve the proposal.')),
      );
    }
  };

  const handleCancel = () => {
    dispatch(closeModalDialog());
  };

  return (
    <ModalDialog
      title={translate('Approve proposal')}
      footer={
        <>
          <Button variant="secondary" onClick={handleCancel}>
            {translate('Cancel')}
          </Button>
          <Button
            variant="primary"
            onClick={handleApprove}
            disabled={tableProps.loading}
          >
            {translate('Approve')}
          </Button>
        </>
      }
    >
      <p className="mb-4">
        {translate(
          'Are you sure you want to approve the proposal "{name}"? The following resources will be allocated:',
          { name: proposal.name },
        )}
      </p>

      <Table<EffectiveAllocationItem>
        {...tableProps}
        rows={activeResources}
        resultCount={activeResources.length}
        columns={[
          {
            title: translate('Offering'),
            render: ({ row }) => (
              <span>
                {row.offering_name}
                {row.is_added && (
                  <span className="badge bg-success ms-2">
                    {translate('Added')}
                  </span>
                )}
                {row.has_modifications && !row.is_added && (
                  <span className="badge bg-warning ms-2">
                    {translate('Modified')}
                  </span>
                )}
              </span>
            ),
          },
          {
            title: translate('Limits'),
            render: ({ row }) => (
              <span
                className={row.has_modifications ? 'fw-bold text-primary' : ''}
              >
                {formatLimits(row.effective_limits)}
              </span>
            ),
          },
        ]}
        verboseName={translate('Resources')}
        minHeight="auto"
        hideRefresh
      />

      {activeResources.length === 0 && !tableProps.loading && (
        <p className="text-muted mt-3">
          {translate('No resources will be allocated.')}
        </p>
      )}
    </ModalDialog>
  );
};
