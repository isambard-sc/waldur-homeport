import { FunctionComponent } from 'react';
import { connect } from 'react-redux';
import { compose } from 'redux';
import { Field, reduxForm } from 'redux-form';

import { AwesomeCheckbox } from '@waldur/core/AwesomeCheckbox';
import { FormContainer, SubmitButton } from '@waldur/form';
import { translate } from '@waldur/i18n';
import { SET_ACCESS_POLICY_FORM_ID } from '@waldur/marketplace/offerings/actions/constants';
import {
  formatRequestBodyForSetAccessPolicyForm,
  getInitialValuesForSetAccessPolicyForm,
} from '@waldur/marketplace/offerings/actions/utils';
import { setAccessPolicy } from '@waldur/marketplace/offerings/store/constants';
import { Division, Offering } from '@waldur/marketplace/types';
import { CloseDialogButton } from '@waldur/modal/CloseDialogButton';
import { ModalDialog } from '@waldur/modal/ModalDialog';

interface SetAccessPolicyDialogFormOwnProps {
  offering: Offering;
  divisions: Division[];
}

const PureSetAccessPolicyDialogForm: FunctionComponent<any> = (props) => (
  <form
    onSubmit={props.handleSubmit(props.submitRequest)}
    className="form-horizontal"
  >
    <ModalDialog
      title={translate('Set access policy for {offeringName}', {
        offeringName: props.offering.name,
      })}
      footer={
        <>
          <CloseDialogButton />
          <SubmitButton
            submitting={props.submitting}
            label={translate('Save')}
          />
        </>
      }
    >
      <FormContainer
        submitting={props.submitting}
        labelClass="col-sm-2"
        controlClass="col-sm-8"
      >
        {props.divisions.map((division) => (
          <Field
            key={division.uuid}
            name={division.uuid}
            component={(prop) => (
              <AwesomeCheckbox label={division.name} {...prop.input} />
            )}
          />
        ))}
      </FormContainer>
    </ModalDialog>
  </form>
);

const mapStateToProps = (
  _state,
  ownProps: SetAccessPolicyDialogFormOwnProps,
) => ({
  initialValues: getInitialValuesForSetAccessPolicyForm(
    ownProps.offering.divisions,
  ),
});

const mapDispatchToProps = (dispatch, ownProps) => ({
  submitRequest: (formData) =>
    setAccessPolicy(
      {
        offeringUuid: ownProps.offering.uuid,
        divisions: formatRequestBodyForSetAccessPolicyForm(
          formData,
          ownProps.divisions,
        ),
      },
      dispatch,
    ),
});

const connector = connect(mapStateToProps, mapDispatchToProps);

const enhance = compose(
  connector,
  reduxForm<SetAccessPolicyDialogFormOwnProps>({
    form: SET_ACCESS_POLICY_FORM_ID,
  }),
);

export const SetAccessPolicyDialogForm = enhance(PureSetAccessPolicyDialogForm);
