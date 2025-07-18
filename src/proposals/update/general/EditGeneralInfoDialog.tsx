import { pick } from 'lodash-es';
import { useCallback } from 'react';
import { connect } from 'react-redux';
import { SubmissionError, reduxForm } from 'redux-form';
import { proposalProtectedCallsPartialUpdate } from 'waldur-js-client';

import { required } from '@waldur/core/validators';
import { NumberField, SubmitButton } from '@waldur/form';
import { AwesomeCheckboxField } from '@waldur/form/AwesomeCheckboxField';
import { FormContainer } from '@waldur/form/FormContainer';
import MarkdownEditor from '@waldur/form/MarkdownEditor';
import { StringField } from '@waldur/form/StringField';
import { translate } from '@waldur/i18n';
import { closeModalDialog, waitForConfirmation } from '@waldur/modal/actions';
import { CloseDialogButton } from '@waldur/modal/CloseDialogButton';
import { ModalDialog } from '@waldur/modal/ModalDialog';
import { EDIT_CALL_GENERAL_FORM_ID } from '@waldur/proposals/constants';
import { EditCallProps } from '@waldur/proposals/types';
import { showErrorResponse, showSuccess } from '@waldur/store/notify';

interface FormData {
  name: string;
  description: string;
  fixed_duration_in_days?: number | null;
}

export const EditGeneralInfoDialog = connect<
  {},
  {},
  { resolve: EditCallProps }
>((_, ownProps) => ({
  initialValues: pick(ownProps.resolve.call, ownProps.resolve.name),
}))(
  reduxForm<FormData, { resolve: EditCallProps }>({
    form: EDIT_CALL_GENERAL_FORM_ID,
  })((props) => {
    const processRequest = useCallback(
      async (values: FormData, dispatch) => {
        if (values.fixed_duration_in_days) {
          try {
            await waitForConfirmation(
              dispatch,
              translate('Confirmation'),
              translate(
                'This will also update durations of connected proposals in Draft or In Review states. Continue?',
              ),
            );
          } catch {
            return;
          }
        }
        const body: any = {};

        if (props.resolve.name === 'fixed_duration_in_days') {
          body.fixed_duration_in_days = values.fixed_duration_in_days || null;
        } else {
          body[props.resolve.name] = values[props.resolve.name];
        }

        return proposalProtectedCallsPartialUpdate({
          path: { uuid: props.resolve.call.uuid },
          body,
        })
          .then(() => {
            props.resolve.refetch();
            dispatch(showSuccess(translate('The call has been updated.')));
            dispatch(closeModalDialog());
          })
          .catch((e) => {
            dispatch(showErrorResponse(e, translate('Unable to update call.')));
            if (e.response && e.response.status === 400) {
              throw new SubmissionError(e.response.data);
            }
          });
      },
      [props.resolve],
    );

    return (
      <form onSubmit={props.handleSubmit(processRequest)}>
        <ModalDialog
          title={props.resolve.title}
          closeButton
          footer={
            <>
              <SubmitButton
                disabled={props.invalid}
                submitting={props.submitting}
                label={translate('Save')}
              />

              <CloseDialogButton />
            </>
          }
        >
          <FormContainer submitting={props.submitting} className="size-lg">
            {props.resolve.name === 'name' && (
              <StringField
                label={translate('Name')}
                name="name"
                required
                validate={required}
              />
            )}
            {props.resolve.name === 'description' && (
              <MarkdownEditor
                name="description"
                required
                autoFocus
                hideLabel
                spaceless
              />
            )}
            {props.resolve.name === 'reference_code' && (
              <StringField
                label={translate('Reference code')}
                name="reference_code"
                required={false}
              />
            )}
            {props.resolve.name === 'external_url' && (
              <StringField
                label={translate('External URL')}
                name="external_url"
                required
                validate={required}
              />
            )}
            {(props.resolve.name === 'reviews_visible_to_submitters' ||
              props.resolve.name ===
                'reviewer_identity_visible_to_submitters') && (
              <AwesomeCheckboxField
                label={props.resolve.title}
                name={props.resolve.name}
              />
            )}
            {props.resolve.name === 'fixed_duration_in_days' && (
              <NumberField
                label={translate(
                  'Fixed duration for granted projects (in days)',
                )}
                name="fixed_duration_in_days"
              />
            )}
          </FormContainer>
        </ModalDialog>
      </form>
    );
  }),
);
