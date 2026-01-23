import { PlusCircleIcon } from '@phosphor-icons/react';
import { useMutation } from '@tanstack/react-query';
import { FC, useCallback } from 'react';
import { Button } from 'react-bootstrap';
import { useDispatch } from 'react-redux';
import {
  Proposal,
  proposalProposalsResourcesDestroy,
  proposalProposalsResourcesList,
} from 'waldur-js-client';

import { lazyComponent } from '@waldur/core/lazyComponent';
import { EditButton } from '@waldur/form/EditButton';
import { formatJsxTemplate, translate } from '@waldur/i18n';
import {
  closeModalDialog,
  openModalDialog,
  waitForConfirmation,
} from '@waldur/modal/actions';
import { ModalDialog } from '@waldur/modal/ModalDialog';
import { ProposalResource } from '@waldur/proposals/types';
import { showErrorResponse, showSuccess } from '@waldur/store/notify';
import { ActionButton, RowActionButton } from '@waldur/table/ActionButton';
import { createFetcher } from '@waldur/table/api';
import Table from '@waldur/table/Table';
import { useTable } from '@waldur/table/useTable';
import { renderFieldOrDash } from '@waldur/table/utils';

import { ResourceRequestExpandableRow } from './create/resource-requests-step/ResourceRequestExpandableRow';

const ResourceRequestFormDialog = lazyComponent(() =>
  import(
    './create/resource-requests-step/ResourceRequestFormDialog'
  ).then((module) => ({
    default: module.ResourceRequestFormDialog,
  })),
);

interface ModifyAllocationDialogProps {
  resolve: {
    proposal: Proposal;
    refetch: () => void;
  };
}

interface ResourceActionsProps {
  row: ProposalResource;
  proposal: Proposal;
  refetch: () => void;
}

const ResourceActions: FC<ResourceActionsProps> = ({
  row,
  proposal,
  refetch,
}) => {
  const dispatch = useDispatch();

  const openEditResourceDialog = useCallback(
    () =>
      dispatch(
        openModalDialog(ResourceRequestFormDialog, {
          resolve: { resourceRequest: row, proposal, refetch },
          size: 'lg',
        }),
      ),
    [dispatch, row, proposal, refetch],
  );

  const { mutate: remove, isPending: isRemoving } = useMutation({
    mutationFn: async () => {
      try {
        await waitForConfirmation(
          dispatch,
          translate('Removing resource request'),
          translate(
            'Are you sure you want to remove the {name} resource request?',
            {
              name: <b>{row.requested_offering.offering_name}</b>,
            },
            formatJsxTemplate,
          ),
        );
      } catch {
        return;
      }
      try {
        await proposalProposalsResourcesDestroy({
          path: { uuid: proposal.uuid, obj_uuid: row.uuid },
        });
        refetch();
        dispatch(showSuccess(translate('Resource request has been deleted.')));
      } catch (response) {
        dispatch(
          showErrorResponse(
            response,
            translate('Unable to delete resource request.'),
          ),
        );
      }
    },
  });

  return (
    <>
      <EditButton onClick={openEditResourceDialog} size="sm" />
      <RowActionButton
        action={remove}
        title={translate('Remove')}
        pending={isRemoving}
        size="sm"
      />
    </>
  );
};

export const ModifyAllocationDialog: FC<ModifyAllocationDialogProps> = ({
  resolve: { proposal, refetch },
}) => {
  const dispatch = useDispatch();

  const tableProps = useTable({
    table: 'ModifyAllocationResourcesList',
    fetchData: createFetcher(proposalProposalsResourcesList, {
      path: { uuid: proposal.uuid },
    }),
  });

  const openAddResourceDialog = useCallback(
    () =>
      dispatch(
        openModalDialog(ResourceRequestFormDialog, {
          resolve: { proposal, refetch: tableProps.fetch },
          size: 'lg',
        }),
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
          'Modify the resources to be allocated for proposal "{name}". You can add, edit, or remove resources.',
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
        tableActions={
          <ActionButton
            title={translate('Add resource')}
            iconNode={<PlusCircleIcon weight="bold" />}
            action={openAddResourceDialog}
          />
        }
        rowActions={({ row, fetch }) => (
          <ResourceActions row={row} proposal={proposal} refetch={fetch} />
        )}
      />
    </ModalDialog>
  );
};
