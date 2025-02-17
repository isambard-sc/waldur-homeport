import { useCallback } from 'react';
import { Modal } from 'react-bootstrap';
import { connect, useDispatch } from 'react-redux';
import { reduxForm } from 'redux-form';

import { SubmitButton } from '@waldur/form';
import { translate } from '@waldur/i18n';
import { updatePlan } from '@waldur/marketplace/common/api';
import { closeModalDialog } from '@waldur/modal/actions';
import { showErrorResponse, showSuccess } from '@waldur/store/notify';

import { formatPlan } from '../../store/utils';

import { EDIT_PLAN_FORM_ID, getBillingPeriods } from './constants';
import { PlanForm } from './PlanForm';

export const EditPlanDescriptionDialog = connect<{}, {}, { resolve: { plan } }>(
  (_, ownProps) => ({
    initialValues: {
      ...ownProps.resolve.plan,
      unit: getBillingPeriods().find(
        ({ value }) => value === ownProps.resolve.plan.unit,
      ),
    },
  }),
)(
  reduxForm<{}, { resolve: { offering; plan; refetch } }>({
    form: EDIT_PLAN_FORM_ID,
  })((props) => {
    const dispatch = useDispatch();
    const update = useCallback(
      async (formData) => {
        try {
          await updatePlan(props.resolve.plan.uuid, formatPlan(formData));
          dispatch(
            showSuccess(translate('Plan has been updated successfully.')),
          );
          await props.resolve.refetch();
          dispatch(closeModalDialog());
        } catch (error) {
          dispatch(
            showErrorResponse(error, translate('Unable to update plan.')),
          );
        }
      },
      [dispatch],
    );

    return (
      <form onSubmit={props.handleSubmit(update)}>
        <Modal.Header>
          <Modal.Title>{translate('Edit plan')}</Modal.Title>
        </Modal.Header>
        <Modal.Body>
          <PlanForm />
        </Modal.Body>
        <Modal.Footer>
          <SubmitButton
            disabled={props.invalid}
            submitting={props.submitting}
            label={translate('Save')}
          />
        </Modal.Footer>
      </form>
    );
  }),
);
