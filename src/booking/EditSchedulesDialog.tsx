import { useCallback } from 'react';
import { Modal } from 'react-bootstrap';
import { connect, useDispatch } from 'react-redux';
import { FieldArray, reduxForm } from 'redux-form';

import { pick } from '@waldur/core/utils';
import { FormContainer, SubmitButton } from '@waldur/form';
import { translate } from '@waldur/i18n';
import { updateOfferingAttributes } from '@waldur/marketplace/common/api';
import { closeModalDialog } from '@waldur/modal/actions';
import { CloseDialogButton } from '@waldur/modal/CloseDialogButton';
import { showErrorResponse, showSuccess } from '@waldur/store/notify';

import { EDIT_SCHEDULES_FORM_ID } from './constants';
import { OfferingScheduler } from './OfferingScheduler';

const formatSchedules = (schedules: any[]) =>
  schedules
    .filter((item) => Object.keys(item).length > 0)
    .map(pick(['start', 'end', 'title', 'allDay', 'extendedProps', 'id']));

export const EditSchedulesDialog = connect(
  (_, ownProps: { resolve: { offering } }) => ({
    initialValues: {
      schedules: ownProps.resolve.offering.attributes?.schedules.map((sch) => {
        // Convert string dates to JS Dates
        if (typeof sch.start === 'string') sch.start = new Date(sch.start);
        if (typeof sch.end === 'string') sch.end = new Date(sch.end);
        return sch;
      }),
    },
  }),
)(
  reduxForm<{}, { resolve: { offering; refetch } }>({
    form: EDIT_SCHEDULES_FORM_ID,
    enableReinitialize: true,
    destroyOnUnmount: true,
  })((props) => {
    const dispatch = useDispatch();
    const update = useCallback(
      async (formData) => {
        try {
          await updateOfferingAttributes(props.resolve.offering.uuid, {
            ...props.resolve.offering.attributes,
            schedules: formatSchedules(formData.schedules),
          });
          dispatch(
            showSuccess(translate('Schedules have been updated successfully.')),
          );
          await props.resolve.refetch();
          dispatch(closeModalDialog());
        } catch (error) {
          dispatch(
            showErrorResponse(error, translate('Unable to update schedules.')),
          );
        }
      },
      [dispatch],
    );

    return (
      <form onSubmit={props.handleSubmit(update)}>
        <Modal.Header>
          <Modal.Title>{translate('Update schedule')}</Modal.Title>
        </Modal.Header>
        <Modal.Body>
          <FormContainer {...props} className="size-xl">
            <FieldArray
              name="schedules"
              rerenderOnEveryChange
              component={OfferingScheduler}
            />
          </FormContainer>
        </Modal.Body>
        <Modal.Footer>
          <SubmitButton
            submitting={props.submitting}
            label={translate('Update')}
          />
          <CloseDialogButton />
        </Modal.Footer>
      </form>
    );
  }),
);
