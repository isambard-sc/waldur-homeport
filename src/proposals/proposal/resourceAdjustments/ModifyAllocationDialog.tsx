import { FC, useCallback } from 'react';
import {
  EffectiveAllocationItem,
  Proposal,
  proposalProposalsEffectiveAllocationList,
  proposalProposalsResourceAdjustmentsCreate,
  proposalProposalsResourceAdjustmentsDestroy,
} from 'waldur-js-client';

import { Badge, BaseButton } from 'waldur-ui';

import { translate } from '@/i18n';
import { useModal } from '@/modal/actions';
import { CloseDialogButton } from '@/modal/CloseDialogButton';
import { ModalDialog } from '@/modal/ModalDialog';
import { useManagedMutation } from '@/modal/useManagedMutation';
import { ActionItem } from '@/resource/actions/ActionItem';
import { RemovalActionItem } from '@/resource/actions/RemovalActionItem';
import { ActionsDropdown } from '@/table/ActionsDropdown';
import { createFetcher } from '@/table/api';
import Table from '@/table/Table';
import { useTable } from '@/table/useTable';

import { AddResourceAdjustmentDialog } from './AddResourceAdjustmentDialog';
import { AdjustmentFormDialog } from './AdjustmentFormDialog';

interface ModifyAllocationDialogProps {
  resolve: {
    proposal: Proposal;
    refetch: () => void;
  };
}

const formatAttributes = (attrs: unknown): string => {
  if (!attrs || typeof attrs !== 'object') return translate('default');
  const entries = Object.entries(attrs as Record<string, unknown>).filter(
    ([, value]) => value != null,
  );
  if (entries.length === 0) return translate('default');
  return entries.map(([key, value]) => `${key}: ${value}`).join(', ');
};

interface AllocationRowActionsProps {
  row: EffectiveAllocationItem;
  proposal: Proposal;
  refetch: () => void;
}

const AllocationRowActions: FC<AllocationRowActionsProps> = ({
  row,
  proposal,
  refetch,
}) => {
  const { openDialog } = useModal();

  const openEditDialog = useCallback(
    () =>
      openDialog(AdjustmentFormDialog, {
        resolve: { proposal, allocationItem: row, refetch },
      }),
    [openDialog, proposal, row, refetch],
  );

  const removeResource = useManagedMutation({
    mutationFn: () =>
      proposalProposalsResourceAdjustmentsCreate({
        path: { uuid: proposal.uuid },
        body: {
          requested_resource: row.requested_resource_uuid as string,
          action: 'remove',
        },
      }),
    confirmation: {
      title: translate('Remove resource'),
      body: translate(
        'Are you sure you want to remove "{name}" from the allocation?',
        { name: row.offering_name },
      ),
    },
    // Closing the row's own confirmation, not the parent ModifyAllocationDialog.
    closeModal: false,
    refetch,
    successMessage: translate('Resource has been removed from the allocation.'),
    errorMessage: translate('Unable to remove resource.'),
  });

  const undoAdjustment = useManagedMutation({
    mutationFn: () =>
      proposalProposalsResourceAdjustmentsDestroy({
        path: {
          uuid: proposal.uuid,
          obj_uuid: (row.adjustment as any).uuid,
        },
      }),
    closeModal: false,
    refetch,
    successMessage: translate('Adjustment has been removed.'),
    errorMessage: translate('Unable to undo adjustment.'),
  });

  // Added/removed/modified rows offer Undo instead of Edit/Remove - the
  // adjustment itself is the thing to take back, not re-editable piecemeal.
  if (row.is_added || row.is_removed || row.has_modifications) {
    return (
      <ActionsDropdown>
        {!row.is_removed && !row.is_added && (
          <ActionItem title={translate('Edit')} action={openEditDialog} />
        )}
        <ActionItem
          title={translate('Undo')}
          action={() => undoAdjustment.mutate()}
          disabled={undoAdjustment.isPending}
        />
      </ActionsDropdown>
    );
  }

  return (
    <ActionsDropdown>
      <ActionItem title={translate('Edit')} action={openEditDialog} />
      <RemovalActionItem
        title={translate('Remove')}
        action={() => removeResource.mutate()}
        disabled={removeResource.isPending}
      />
    </ActionsDropdown>
  );
};

export const ModifyAllocationDialog: FC<ModifyAllocationDialogProps> = ({
  resolve: { proposal, refetch },
}) => {
  const { openDialog, closeDialog } = useModal();

  const tableProps = useTable({
    table: 'EffectiveAllocationList',
    fetchData: createFetcher(proposalProposalsEffectiveAllocationList, {
      path: { uuid: proposal.uuid },
    }),
  });

  const openAddResourceDialog = useCallback(
    () =>
      openDialog(AddResourceAdjustmentDialog, {
        resolve: { proposal, refetch: tableProps.fetch },
      }),
    [openDialog, proposal, tableProps.fetch],
  );

  return (
    <ModalDialog
      title={translate('Modify allocation')}
      footer={
        <CloseDialogButton
          label={translate('Done')}
          onClick={() => {
            closeDialog();
            refetch();
          }}
        />
      }
    >
      <p className="mb-4">
        {translate(
          'Modify the resources to be allocated for proposal "{name}". You can adjust limits, remove resources, or add new ones.',
          { name: proposal.name },
        )}
      </p>

      <Table<EffectiveAllocationItem>
        {...tableProps}
        columns={[
          {
            title: translate('Offering'),
            render: ({ row }) => (
              <span
                className={
                  row.is_removed
                    ? 'text-decoration-line-through text-muted'
                    : ''
                }
              >
                {row.offering_name}{' '}
                {row.is_added && (
                  <Badge variant="success" tone="outline">
                    {translate('Added')}
                  </Badge>
                )}
                {row.is_removed && (
                  <Badge variant="danger" tone="outline">
                    {translate('Removed')}
                  </Badge>
                )}
                {row.has_modifications && !row.is_removed && !row.is_added && (
                  <Badge variant="warning" tone="outline">
                    {translate('Modified')}
                  </Badge>
                )}
              </span>
            ),
          },
          {
            title: translate('Original allocation'),
            render: ({ row }) => (
              <>{formatAttributes(row.original_attributes)}</>
            ),
          },
          {
            title: translate('Effective allocation'),
            render: ({ row }) => (
              <span
                className={row.has_modifications ? 'fw-bold text-primary' : ''}
              >
                {formatAttributes(row.effective_attributes)}
              </span>
            ),
          },
        ]}
        verboseName={translate('Resources')}
        minHeight="auto"
        hideRefresh
        tableActions={
          <BaseButton
            variant="primary"
            label={translate('Add resource')}
            onClick={openAddResourceDialog}
          />
        }
        rowActions={({ row, fetch }) => (
          <AllocationRowActions row={row} proposal={proposal} refetch={fetch} />
        )}
      />
    </ModalDialog>
  );
};
