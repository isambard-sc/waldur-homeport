import { useDispatch } from 'react-redux';
import { InjectedFormProps } from 'redux-form';

import { LoadingSpinner } from '@waldur/core/LoadingSpinner';
import { SubmitButton } from '@waldur/form';
import { translate } from '@waldur/i18n';
import * as api from '@waldur/marketplace/common/api';
import { Limits } from '@waldur/marketplace/common/types';
import { closeModalDialog } from '@waldur/modal/actions';
import { CloseDialogButton } from '@waldur/modal/CloseDialogButton';
import { ModalDialog } from '@waldur/modal/ModalDialog';
import { showErrorResponse, showSuccess } from '@waldur/store/notify';

import { ChangeLimitsComponent } from './ChangeLimitsComponent';
import { connector, OwnProps, StateProps } from './connector';

interface DialogBodyProps extends OwnProps, InjectedFormProps, StateProps {
  submitRequest(data: any): void;
  orderCanBeApproved: boolean;
  initialValues: { limits: Limits };
}

export const DialogBody = connector((props: DialogBodyProps) => {
  const dispatch = useDispatch();
  const submitRequest = async (formData) => {
    try {
      await api.changeLimits(
        props.asyncState.value.resource.uuid,
        props.asyncState.value.limitSerializer(formData.limits),
      );
      dispatch(
        showSuccess(
          translate('Resource limits change request has been submitted.'),
        ),
      );
      dispatch(closeModalDialog());
      if (props.refetch) {
        await props.refetch();
      }
    } catch (error) {
      dispatch(
        showErrorResponse(
          error,
          translate('Unable to submit limits change request.'),
        ),
      );
    }
  };

  return (
    <form onSubmit={props.handleSubmit(submitRequest)}>
      <ModalDialog
        title={translate('Change resource limits')}
        footer={
          <>
            <CloseDialogButton />
            {!props.asyncState.loading && (
              <SubmitButton
                submitting={props.submitting}
                label={
                  props.orderCanBeApproved
                    ? translate('Submit')
                    : translate('Request for a change')
                }
              />
            )}
          </>
        }
      >
        {props.asyncState.loading ? (
          <LoadingSpinner />
        ) : props.asyncState.error ? (
          <h3>{translate('Unable to load data.')}</h3>
        ) : (
          <ChangeLimitsComponent
            plan={props.asyncState.value.plan}
            periods={props.periods}
            components={props.components}
            orderCanBeApproved={props.orderCanBeApproved}
            totalPeriods={props.totalPeriods}
            changedTotalPeriods={props.changedTotalPeriods}
            offeringLimits={props.asyncState.value.offeringLimits}
            shouldConcealPrices={props.shouldConcealPrices}
          />
        )}
      </ModalDialog>
    </form>
  );
});
