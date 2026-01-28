import { FC } from 'react';
import { Button } from 'react-bootstrap';
import { useDispatch } from 'react-redux';
import {
  Proposal,
  proposalProposalsApprove,
  proposalProposalsResourcesList,
} from 'waldur-js-client';

import { translate } from '@waldur/i18n';
import { closeModalDialog } from '@waldur/modal/actions';
import { ModalDialog } from '@waldur/modal/ModalDialog';
import { ProposalResource } from '@waldur/proposals/types';
import { showErrorResponse, showSuccess } from '@waldur/store/notify';
import { createFetcher } from '@waldur/table/api';
import Table from '@waldur/table/Table';
import { useTable } from '@waldur/table/useTable';
import { renderFieldOrDash } from '@waldur/table/utils';

import { ResourceRequestExpandableRow } from './create/resource-requests-step/ResourceRequestExpandableRow';

interface ApprovalConfirmationDialogProps {
  resolve: {
    proposal: Proposal;
    refetch: () => void;
  };
}

export const ApprovalConfirmationDialog: FC<ApprovalConfirmationDialogProps> = ({
  resolve: { proposal, refetch },
}) => {
  const dispatch = useDispatch();

  const tableProps = useTable({
    table: 'ApprovalResourcesList',
    fetchData: createFetcher(proposalProposalsResourcesList, {
      path: { uuid: proposal.uuid },
    }),
  });

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

      <Table<ProposalResource>
        {...tableProps}
        columns={[
          {
            title: translate('Offering'),
            render: ({ row }) => <>{row.requested_offering.offering_name}</>,
          },
          {
            title: translate('Provider'),
            render: ({ row }) => <>{row.requested_offering.provider_name}</>,
          },
          {
            title: translate('Category'),
            render: ({ row }) => (
              <>{renderFieldOrDash(row.requested_offering.category_name)}</>
            ),
          },
        ]}
        verboseName={translate('Resources')}
        expandableRow={ResourceRequestExpandableRow}
        minHeight="auto"
        hideRefresh
      />
    </ModalDialog>
  );
};
