import { PencilSimpleIcon, PlusCircleIcon } from '@phosphor-icons/react';
import { useQuery } from '@tanstack/react-query';
import arrayMutators from 'final-form-arrays';
import { FC, useMemo } from 'react';
import { Form } from 'react-final-form';
import {
  FormbricksFlow,
  proposalFormbricksFlowsChoicesRetrieve,
  proposalFormbricksFlowsCreate,
  proposalFormbricksFlowsUpdate,
} from 'waldur-js-client';

import { LoadingErred } from '@/core/LoadingErred';
import { LoadingSpinner } from '@/core/LoadingSpinner';
import { required } from '@/core/validators';
import { StringGroup, SubmitButton, TextGroup } from '@/form';
import { translate } from '@/i18n';
import { CloseDialogButton } from '@/modal/CloseDialogButton';
import { ModalDialog } from '@/modal/ModalDialog';
import { useManagedMutation } from '@/modal/useManagedMutation';

import { FormbricksFlowStepsField } from './FormbricksFlowStepsField';
import { FlowFormValues, flowToFormValues, formValuesToPayload } from './utils';

interface OwnProps {
  resolve: {
    row?: FormbricksFlow;
    refetch(): void;
  };
}

export const FormbricksFlowFormDialog: FC<OwnProps> = ({
  resolve: { row, refetch },
}) => {
  const isEdit = Boolean(row?.uuid);
  const initialValues = useMemo(() => flowToFormValues(row), [row]);

  const {
    data: choices,
    isLoading,
    error,
    refetch: refetchChoices,
  } = useQuery({
    queryKey: ['FormbricksFlowChoices'],
    queryFn: () =>
      proposalFormbricksFlowsChoicesRetrieve().then(({ data }) => data),
    staleTime: Infinity,
  });

  const submitMutation = useManagedMutation({
    mutationFn: (values: FlowFormValues) => {
      const body = formValuesToPayload(values);
      return isEdit
        ? proposalFormbricksFlowsUpdate({ path: { uuid: row.uuid }, body })
        : proposalFormbricksFlowsCreate({ body });
    },
    successMessage: isEdit
      ? translate('Formbricks flow has been updated.')
      : translate('Formbricks flow has been created.'),
    errorMessage: isEdit
      ? translate('Unable to update the Formbricks flow.')
      : translate('Unable to create the Formbricks flow.'),
    refetch,
  });

  return (
    <Form<FlowFormValues>
      onSubmit={(values) => submitMutation.mutateAsync(values)}
      initialValues={initialValues}
      mutators={{ ...arrayMutators }}
      render={({ handleSubmit, submitting, invalid }) => (
        <form onSubmit={handleSubmit}>
          <ModalDialog
            title={
              isEdit
                ? translate('Edit Formbricks flow')
                : translate('Create Formbricks flow')
            }
            iconNode={
              isEdit ? (
                <PencilSimpleIcon weight="bold" />
              ) : (
                <PlusCircleIcon weight="bold" />
              )
            }
            iconColor="success"
            footer={
              <>
                <CloseDialogButton className="min-w-125px" />
                <SubmitButton
                  submitting={submitting}
                  label={isEdit ? translate('Save') : translate('Create')}
                  disabled={invalid || !choices}
                  variant="primary"
                  className="min-w-125px"
                />
              </>
            }
          >
            {isLoading ? (
              <LoadingSpinner />
            ) : error ? (
              <LoadingErred
                loadData={refetchChoices}
                message={translate('Unable to load the flow options.')}
              />
            ) : (
              <>
                <StringGroup
                  name="name"
                  label={translate('Name')}
                  required
                  validate={required}
                />
                <TextGroup
                  name="description"
                  label={translate('Description')}
                />
                <FormbricksFlowStepsField choices={choices} />
              </>
            )}
          </ModalDialog>
        </form>
      )}
    />
  );
};
