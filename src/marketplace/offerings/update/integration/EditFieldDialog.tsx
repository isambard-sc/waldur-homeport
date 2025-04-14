import { get, pick } from 'lodash-es';
import { useCallback, useEffect } from 'react';
import { connect, useDispatch } from 'react-redux';
import { Field, change, reduxForm } from 'redux-form';

import { SubmitButton } from '@waldur/form';
import { FormContainer } from '@waldur/form/FormContainer';
import { translate } from '@waldur/i18n';
import { closeModalDialog } from '@waldur/modal/actions';
import { CloseDialogButton } from '@waldur/modal/CloseDialogButton';
import { ModalDialog } from '@waldur/modal/ModalDialog';

import { EDIT_INTEGRATION_FORM_ID } from './constants';
import { EditOfferingProps } from './types';

type FormData = Record<string, any>;

export const EditFieldDialog = connect<{}, {}, { resolve: EditOfferingProps }>(
  (_, ownProps) => {
    const current = get(ownProps.resolve.scope, ownProps.resolve.name);
    // It seems that there is a bug on redux-form initialization, cannot properly remove elements of an array field.
    // We initialize array fields with `change` function.
    return {
      current,
      initialValues: Array.isArray(current)
        ? {}
        : pick(ownProps.resolve.scope, ownProps.resolve.name),
    };
  },
)(
  reduxForm<FormData, { resolve: EditOfferingProps; current }>({
    form: EDIT_INTEGRATION_FORM_ID,
    destroyOnUnmount: true,
  })((props) => {
    const dispatch = useDispatch();
    useEffect(() => {
      if (Array.isArray(props.current)) {
        dispatch(change(props.form, props.resolve.name, props.current));
      }
    }, []);

    const processRequest = useCallback(
      (values: FormData, dispatch) => {
        return props.resolve.callback(values).then(() => {
          dispatch(closeModalDialog());
        });
      },
      [props.resolve.callback],
    );

    return (
      <form onSubmit={props.handleSubmit(processRequest)}>
        <ModalDialog
          title={props.resolve.title}
          subtitle={props.resolve.description}
          headerLess={!props.resolve.title}
          bodyClassName="pb-2"
          footerClassName="border-0 pt-0 gap-2"
          footer={
            <>
              <CloseDialogButton className="flex-grow-1" />
              <SubmitButton
                disabled={props.invalid || !props.dirty}
                submitting={props.submitting}
                label={translate('Confirm')}
                className="btn btn-primary flex-grow-1"
              />
            </>
          }
        >
          <FormContainer submitting={props.submitting}>
            <Field
              component={props.resolve.fieldComponent}
              name={props.resolve.name}
              label={props.resolve.label}
              hideLabel={props.resolve.hideLabel}
              tooltip={props.resolve.warnTooltip}
              required={props.resolve.required}
              {...props.resolve.fieldProps}
            />
          </FormContainer>
        </ModalDialog>
      </form>
    );
  }),
);
