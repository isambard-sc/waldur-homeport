import {
  CheckSquareIcon,
  PencilSimpleIcon,
  PlusIcon,
} from '@phosphor-icons/react';
import { useMemo } from 'react';
import { useSelector } from 'react-redux';
import { FormFlow, formFlowsDestroy, formFlowsList } from 'waldur-js-client';

import { BaseButton } from 'waldur-ui';

import { formatDateTime } from '@/core/dateUtils';
import { lazyComponent } from '@/core/lazyComponent';
import { translate } from '@/i18n';
import { useModal } from '@/modal/actions';
import { useManagedMutation } from '@/modal/useManagedMutation';
import { ActionItem } from '@/resource/actions/ActionItem';
import { RemovalActionItem } from '@/resource/actions/RemovalActionItem';
import { ActionsDropdown } from '@/table/ActionsDropdown';
import { createFetcher } from '@/table/api';
import { ExpandableContainer } from '@/table/ExpandableContainer';
import Table from '@/table/Table';
import { Column } from '@/table/types';
import { useTable } from '@/table/useTable';
import { isStaff } from '@/workspace/selectors';

import { FORM_FLOWS_QUERY_KEY } from './FormFlowDialog';

const FormFlowDialog = lazyComponent(() =>
  import('./FormFlowDialog').then((module) => ({
    default: module.FormFlowDialog,
  })),
);

const FormFlowCheckDialog = lazyComponent(() =>
  import('./FormFlowCheckDialog').then((module) => ({
    default: module.FormFlowCheckDialog,
  })),
);

const DeleteFlowAction = ({
  row,
  refetch,
}: {
  row: FormFlow;
  refetch(): void;
}) => {
  const deleteFlow = useManagedMutation({
    mutationFn: () => formFlowsDestroy({ path: { uuid: row.uuid } }),
    successMessage: translate('The form flow has been deleted.'),
    errorMessage: translate('Unable to delete the form flow.'),
    refetch,
    confirmation: {
      title: translate('Delete form flow'),
      body: translate('Delete the form flow {name}?', { name: row.name }),
      options: { forDeletion: true },
    },
    closeModal: false,
  });
  const inUse = row.calls_count > 0;
  return (
    <RemovalActionItem
      title={translate('Delete')}
      action={() => deleteFlow.mutate(undefined)}
      disabled={inUse || deleteFlow.isPending}
      tooltip={
        inUse
          ? translate(
              'Calls use this flow. Choose another form for them first.',
            )
          : undefined
      }
    />
  );
};

/** The steps of one flow, shown when its row is expanded. */
const FlowStepsTable = ({ row }: { row: FormFlow }) => {
  const tableProps = useTable({
    table: `form-flow-steps-${row.uuid}`,
    fetchData: () =>
      Promise.resolve({ rows: row.steps, resultCount: row.steps.length }),
  });
  const columns: Column<FormFlow['steps'][number]>[] = [
    { title: translate('Step'), render: ({ row: step }) => step.label },
    { title: translate('Key'), render: ({ row: step }) => step.key },
    { title: translate('Survey'), render: ({ row: step }) => step.survey_id },
    {
      title: translate('Reviewers see it'),
      render: ({ row: step }) =>
        step.reviewer_visible ? translate('Yes') : translate('No'),
    },
  ];
  return (
    <ExpandableContainer>
      <Table
        {...tableProps}
        columns={columns}
        verboseName={translate('steps')}
        hideTitle
        hasActionBar={false}
        placeholderHasRetry={false}
      />
    </ExpandableContainer>
  );
};

/**
 * The site's form flows: each a set of Formbricks surveys a call asks
 * applicants to fill in beside the proposal form.
 *
 * Staff add, change and delete them; anyone else here sees them and can
 * check them against Formbricks.
 */
export const FormFlowsCard = () => {
  const canEdit = useSelector(isStaff);
  const { openDialog } = useModal();

  const tableProps = useTable({
    table: FORM_FLOWS_QUERY_KEY,
    fetchData: createFetcher(formFlowsList),
  });

  const openFlowDialog = (flow?: FormFlow) =>
    openDialog(FormFlowDialog, {
      resolve: { flow, refetch: tableProps.fetch },
      size: 'xl',
    });

  const columns = useMemo<Column<FormFlow>[]>(
    () => [
      {
        title: translate('Name'),
        render: ({ row }) => row.name,
        copyField: (row) => row.name,
      },
      { title: translate('Key'), render: ({ row }) => row.key },
      {
        title: translate('Used for'),
        render: ({ row }) =>
          row.purpose === 'closing'
            ? translate('End of project')
            : translate('Applications'),
      },
      {
        title: translate('Steps'),
        render: ({ row }) => row.steps.length,
      },
      {
        title: translate('Calls using it'),
        render: ({ row }) => row.calls_count,
      },
      {
        title: translate('Modified'),
        render: ({ row }) => formatDateTime(row.modified),
      },
    ],
    [],
  );

  return (
    <Table
      {...tableProps}
      columns={columns}
      title={translate('Form flows')}
      verboseName={translate('form flows')}
      className="mb-5"
      expandableRow={FlowStepsTable}
      tableActions={
        canEdit ? (
          <BaseButton
            variant="primary"
            iconNode={<PlusIcon weight="bold" />}
            label={translate('Add flow')}
            onClick={() => openFlowDialog()}
          />
        ) : null
      }
      rowActions={({ row }) => (
        <ActionsDropdown row={row} refetch={tableProps.fetch}>
          {canEdit && (
            <ActionItem
              title={translate('Edit')}
              action={() => openFlowDialog(row)}
              iconNode={<PencilSimpleIcon weight="bold" />}
            />
          )}
          <ActionItem
            title={translate('Check and sync surveys')}
            action={() =>
              openDialog(FormFlowCheckDialog, {
                resolve: { flow: row },
                size: 'lg',
              })
            }
            iconNode={<CheckSquareIcon weight="bold" />}
          />
          {canEdit && <DeleteFlowAction row={row} refetch={tableProps.fetch} />}
        </ActionsDropdown>
      )}
    />
  );
};
