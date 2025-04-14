import { useCallback } from 'react';
import { connect, useDispatch } from 'react-redux';
import { compose } from 'redux';
import { Field, reduxForm } from 'redux-form';
import { marketplaceProviderOfferingsUpdateUser } from 'waldur-js-client';

import { SubmitButton } from '@waldur/auth/SubmitButton';
import { FormContainer } from '@waldur/form';
import { DateTimeField } from '@waldur/form/DateTimeField';
import { translate } from '@waldur/i18n';
import { closeModalDialog } from '@waldur/modal/actions';
import { CloseDialogButton } from '@waldur/modal/CloseDialogButton';
import { ModalDialog } from '@waldur/modal/ModalDialog';
import { showErrorResponse, showSuccess } from '@waldur/store/notify';

import { UPDATE_OFFERING_PERMISSION_EXPIRATION_TIME_FORM_ID } from './constants';

const PureUpdateOfferingPermissionExpirationTimeDialog = (props) => {
  const dispatch = useDispatch();
  const update = useCallback(
    async (formData) => {
      try {
        await marketplaceProviderOfferingsUpdateUser({
          path: { uuid: props.resolve.permission.offering_uuid },
          body: {
            user: props.resolve.permission.user_uuid,
            role: props.resolve.permission.role_name,
            expiration_time: formData.expiration_time,
          },
        });
        dispatch(
          showSuccess(translate('Permission has been updated successfully.')),
        );
        dispatch(closeModalDialog());
        await props.resolve.fetch();
      } catch (error) {
        dispatch(
          showErrorResponse(error, translate('Unable to update permission.')),
        );
      }
    },
    [dispatch],
  );
  return (
    <form onSubmit={props.handleSubmit(update)}>
      <ModalDialog
        title={translate('Update permission of {name}', {
          name: props.resolve.permission.offering_name,
        })}
        footer={
          <>
            <CloseDialogButton />
            <SubmitButton submitting={props.submitting}>
              {translate('Update')}
            </SubmitButton>
          </>
        }
      >
        <FormContainer submitting={props.submitting}>
          <Field
            name="expiration_time"
            label={translate('Expiration time')}
            component={DateTimeField}
          />
        </FormContainer>
      </ModalDialog>
    </form>
  );
};

const mapStateToProps = (_state, ownProps) => ({
  initialValues: {
    expiration_time: ownProps.resolve.permission.expiration_time,
  },
});

const enhance = compose(
  connect(mapStateToProps),
  reduxForm({
    form: UPDATE_OFFERING_PERMISSION_EXPIRATION_TIME_FORM_ID,
  }),
);

export const UpdateOfferingPermissionExpirationTimeDialog = enhance(
  PureUpdateOfferingPermissionExpirationTimeDialog,
);
