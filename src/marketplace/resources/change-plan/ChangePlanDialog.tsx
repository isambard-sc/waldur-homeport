import React from 'react';
import { Field, Form } from 'react-final-form';
import { useAsync } from 'react-use';

import { LoadingSpinner } from '@waldur/core/LoadingSpinner';
import { SubmitButton } from '@waldur/form';
import { ChoicesTable } from '@waldur/form/ChoicesTable';
import { translate } from '@waldur/i18n';
import { switchPlan } from '@waldur/marketplace/common/api';
import { CloseDialogButton } from '@waldur/modal/CloseDialogButton';
import { useModal } from '@waldur/modal/hooks';
import { ModalDialog } from '@waldur/modal/ModalDialog';
import { PermissionEnum } from '@waldur/permissions/enums';
import { usePermission } from '@waldur/permissions/hooks';
import { useNotify } from '@waldur/store/hooks';

import { FetchedData, loadData } from './utils';

interface ChangePlanDialogProps {
  resolve: {
    resource: {
      marketplace_resource_uuid: string;
    };
    refetch;
  };
}

const ChangePlanComponent = (props: FetchedData & { refetch? }) => {
  const hasPemission = usePermission();
  const orderCanBeApproved = hasPemission({
    permission: PermissionEnum.APPROVE_ORDER,
    customerId: props.resource.customer_uuid,
    projectId: props.resource.project_uuid,
  });

  const { showErrorResponse, showSuccess } = useNotify();
  const { closeDialog } = useModal();

  const handleSwitchPlan = async (data) => {
    try {
      await switchPlan(props.resource.uuid, data.plan.url);
      showSuccess(
        translate('Resource plan change request has been submitted.'),
      );
      closeDialog();
      if (props.refetch) {
        await props.refetch();
      }
    } catch (error) {
      showErrorResponse(
        error,
        translate('Unable to submit plan change request.'),
      );
    }
  };

  return (
    <Form
      onSubmit={handleSwitchPlan}
      initialValues={props.initialValues}
      render={({ handleSubmit, submitting }) => (
        <form onSubmit={handleSubmit}>
          <ModalDialog
            title={translate('Change resource plan')}
            footer={
              <>
                <CloseDialogButton />
                <SubmitButton
                  submitting={submitting}
                  label={
                    orderCanBeApproved
                      ? translate('Submit')
                      : translate('Request for a change')
                  }
                />
              </>
            }
          >
            {props.resource.plan_name ? (
              <p>
                <strong>{translate('Current plan')}</strong>:{' '}
                {props.resource.plan_name}
              </p>
            ) : (
              <p>{translate('Resource does not have any plan.')}</p>
            )}
            {props.choices.length > 1 ? (
              <div>
                <strong>{translate('New plan')}</strong>
                <Field
                  name="plan"
                  component={(fieldProps) => (
                    <ChoicesTable
                      columns={props.columns}
                      choices={props.choices.filter(
                        (plan) => plan.archived === false,
                      )}
                      input={fieldProps.input}
                    />
                  )}
                />
              </div>
            ) : (
              <p>{translate('There are no other plans available.')}</p>
            )}
          </ModalDialog>
        </form>
      )}
    />
  );
};

export const ChangePlanDialog: React.FC<ChangePlanDialogProps> = ({
  resolve: { resource, refetch },
}) => {
  const asyncState = useAsync(
    () => loadData(resource.marketplace_resource_uuid),
    [resource.marketplace_resource_uuid],
  );
  return asyncState.value ? (
    <ChangePlanComponent
      resource={asyncState.value.resource}
      choices={asyncState.value.choices}
      columns={asyncState.value.columns}
      initialValues={asyncState.value.initialValues}
      refetch={refetch}
    />
  ) : asyncState.loading ? (
    <ModalDialog title={translate('Change resource plan')}>
      <LoadingSpinner />
    </ModalDialog>
  ) : asyncState.error ? (
    <ModalDialog title={translate('Change resource plan')}>
      <h3>{translate('Unable to load data.')}</h3>
    </ModalDialog>
  ) : null;
};
