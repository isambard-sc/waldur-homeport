import {
  ArrowCounterClockwiseIcon,
  PlusCircleIcon,
  TrashIcon,
} from '@phosphor-icons/react';
import { useMutation } from '@tanstack/react-query';
import { FC, useCallback } from 'react';
import { Button } from 'react-bootstrap';
import { useDispatch } from 'react-redux';
import {
  EffectiveAllocationItem,
  Proposal,
  proposalProposalsEffectiveAllocationList,
  proposalProposalsResourceAdjustmentsCreate,
  proposalProposalsResourceAdjustmentsDestroy,
} from 'waldur-js-client';

import { lazyComponent } from '@waldur/core/lazyComponent';
import { EditButton } from '@waldur/form/EditButton';
import { translate } from '@waldur/i18n';
import {
  closeModalDialog,
  openModalDialog,
  waitForConfirmation,
} from '@waldur/modal/actions';
import { ModalDialog } from '@waldur/modal/ModalDialog';
import { showErrorResponse, showSuccess } from '@waldur/store/notify';
import { ActionButton, RowActionButton } from '@waldur/table/ActionButton';
import { createFetcher } from '@waldur/table/api';
import Table from '@waldur/table/Table';
import { useTable } from '@waldur/table/useTable';

const AdjustmentFormDialog = lazyComponent(() =>
  import('./AdjustmentFormDialog').then((module) => ({
    default: module.AdjustmentFormDialog,
  })),
);

const AddResourceAdjustmentDialog = lazyComponent(() =>
  import('./AddResourceAdjustmentDialog').then((module) => ({
    default: module.AddResourceAdjustmentDialog,
  })),
);

interface ModifyAllocationDialogProps {
  resolve: {
    proposal: Proposal;
    refetch: () => void;
  };
}

interface AllocationActionsProps {
  row: EffectiveAllocationItem;
  proposal: Proposal;
  refetch: () => void;
}

const AllocationActions: FC<AllocationActionsProps> = ({
  row,
  proposal,
  refetch,
}) => {
  const dispatch = useDispatch();

  const openEditDialog = useCallback(
    () =>
      dispatch(
        openModalDialog(
          AdjustmentFormDialog,
          {
            resolve: {
              proposal,
              allocationItem: row,
              refetch,
            },
            size: 'lg',
          },
          'SHOW_CONFIRM',
        ),
      ),
    [dispatch, proposal, row, refetch],
  );

  const { mutate: removeResource, isPending: isRemoving } = useMutation({
    mutationFn: async () => {
      try {
        await waitForConfirmation(
          dispatch,
          translate('Remove resource'),
          translate(
            'Are you sure you want to remove "{name}" from the allocation?',
            { name: row.offering_name },
          ),
        );
      } catch {
        return;
      }
      try {
        await proposalProposalsResourceAdjustmentsCreate({
          path: { uuid: proposal.uuid },
          body: {
            requested_resource_uuid: row.requested_resource_uuid,
            action: 'remove',
          },
        });
        refetch();
        dispatch(
          showSuccess(translate('Resource has been removed from allocation.')),
        );
      } catch (error) {
        dispatch(
          showErrorResponse(error, translate('Unable to remove resource.')),
        );
      }
    },
  });

  const { mutate: undoAdjustment, isPending: isUndoing } = useMutation({
    mutationFn: async () => {
      if (!row.adjustment) return;
      try {
        await proposalProposalsResourceAdjustmentsDestroy({
          path: {
            uuid: proposal.uuid,
            obj_uuid: (row.adjustment as any).uuid,
          },
        });
        refetch();
        dispatch(showSuccess(translate('Adjustment has been removed.')));
      } catch (error) {
        dispatch(
          showErrorResponse(error, translate('Unable to undo adjustment.')),
        );
      }
    },
  });

  // If this is an added resource or has been modified/removed, show undo button
  if (row.is_added || row.is_removed || row.has_modifications) {
    return (
      <>
        {!row.is_removed && !row.is_added && (
          <EditButton onClick={openEditDialog} size="sm" />
        )}
        <RowActionButton
          action={undoAdjustment}
          title={translate('Undo')}
          pending={isUndoing}
          size="sm"
          iconNode={<ArrowCounterClockwiseIcon />}
        />
      </>
    );
  }

  // For original resources without adjustments
  return (
    <>
      <EditButton onClick={openEditDialog} size="sm" />
      <RowActionButton
        action={removeResource}
        title={translate('Remove')}
        pending={isRemoving}
        size="sm"
        iconNode={<TrashIcon />}
      />
    </>
  );
};

const formatAttributes = (attrs: unknown): string => {
  if (!attrs || typeof attrs !== 'object') return translate('default');
  const entries = Object.entries(attrs as Record<string, unknown>).filter(
    ([, value]) => value != null,
  );
  if (entries.length === 0) return translate('default');
  return entries.map(([key, value]) => `${key}: ${value}`).join(', ');
};

export const ModifyAllocationDialog: FC<ModifyAllocationDialogProps> = ({
  resolve: { proposal, refetch },
}) => {
  const dispatch = useDispatch();

  const tableProps = useTable({
    table: 'EffectiveAllocationList',
    fetchData: createFetcher(proposalProposalsEffectiveAllocationList, {
      path: { uuid: proposal.uuid },
    }),
  });

  const openAddResourceDialog = useCallback(
    () =>
      dispatch(
        openModalDialog(
          AddResourceAdjustmentDialog,
          {
            resolve: { proposal, refetch: tableProps.fetch },
            size: 'lg',
          },
          'SHOW_CONFIRM',
        ),
      ),
    [dispatch, proposal, tableProps.fetch],
  );

  const handleClose = () => {
    dispatch(closeModalDialog());
    refetch();
  };

  return (
    <ModalDialog
      title={translate('Modify allocation')}
      footer={
        <Button variant="primary" onClick={handleClose}>
          {translate('Done')}
        </Button>
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
                {row.offering_name}
                {row.is_added && (
                  <span className="badge bg-success ms-2">
                    {translate('Added')}
                  </span>
                )}
                {row.is_removed && (
                  <span className="badge bg-danger ms-2">
                    {translate('Removed')}
                  </span>
                )}
                {row.has_modifications && !row.is_removed && !row.is_added && (
                  <span className="badge bg-warning ms-2">
                    {translate('Modified')}
                  </span>
                )}
              </span>
            ),
          },
          {
            title: translate('Original allocation'),
            render: ({ row }) => <>{formatAttributes(row.original_attributes)}</>,
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
        tableActions={
          <ActionButton
            title={translate('Add resource')}
            iconNode={<PlusCircleIcon weight="bold" />}
            action={openAddResourceDialog}
          />
        }
        rowActions={({ row, fetch }) => (
          <AllocationActions row={row} proposal={proposal} refetch={fetch} />
        )}
      />
    </ModalDialog>
  );
};
