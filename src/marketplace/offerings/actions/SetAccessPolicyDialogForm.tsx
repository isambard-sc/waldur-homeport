import { FunctionComponent } from 'react';
import { connect, useDispatch } from 'react-redux';
import { compose } from 'redux';
import { reduxForm } from 'redux-form';

import { updateCustomerOrganizationGroups } from '@waldur/customer/details/api';
import { SubmitButton } from '@waldur/form';
import { translate } from '@waldur/i18n';
import {
  updateOfferingAccessPolicy,
  updatePlanAccessPolicy,
} from '@waldur/marketplace/common/api';
import { SET_ACCESS_POLICY_FORM_ID } from '@waldur/marketplace/offerings/actions/constants';
import {
  formatRequestBodyForSetAccessPolicyForm,
  getInitialValuesForSetAccessPolicyForm,
} from '@waldur/marketplace/offerings/actions/utils';
import { Offering, OrganizationGroup, Plan } from '@waldur/marketplace/types';
import { closeModalDialog } from '@waldur/modal/actions';
import { CloseDialogButton } from '@waldur/modal/CloseDialogButton';
import { ModalDialog } from '@waldur/modal/ModalDialog';
import { showErrorResponse, showSuccess } from '@waldur/store/notify';

import { SetAccessPolicyFormContainer } from './SetAccessPolicyFormContainer';

interface SetAccessPolicyDialogFormOwnProps {
  offering?: Offering;
  plan?: Plan;
  customer?: any;
  organizationGroups: OrganizationGroup[];
  refetch: any;
}

const PureSetAccessPolicyDialogForm: FunctionComponent<any> = (props) => {
  const dispatch = useDispatch();
  const submitRequest = async (formData) => {
    try {
      const updateAccessPolicy = props.plan
        ? updatePlanAccessPolicy
        : props.offering
          ? updateOfferingAccessPolicy
          : updateCustomerOrganizationGroups;
      const uuid = props.plan
        ? props.plan.uuid
        : props.offering
          ? props.offering.uuid
          : props.customer.uuid;

      await updateAccessPolicy(
        uuid,
        formatRequestBodyForSetAccessPolicyForm(
          formData,
          props.organizationGroups,
        ),
      );
      dispatch(
        showSuccess(translate('Access policy has been updated successfully.')),
      );
      props.refetch();
      dispatch(closeModalDialog());
    } catch (error) {
      dispatch(
        showErrorResponse(error, translate('Unable to update access policy.')),
      );
    }
  };
  return (
    <form onSubmit={props.handleSubmit(submitRequest)}>
      <ModalDialog
        title={translate(
          props.plan
            ? 'Set access policy for {planName}'
            : props.offering
              ? 'Set access policy for {offeringName}'
              : 'Set organization groups for {customerName}',
          {
            planName: props.plan?.name,
            offeringName: props.offering?.name,
            customerName: props.customer?.name,
          },
        )}
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
        <SetAccessPolicyFormContainer
          organizationGroups={props.organizationGroups}
          submitting={props.submitting}
        />
      </ModalDialog>
    </form>
  );
};

const mapStateToProps = (
  _state,
  ownProps: SetAccessPolicyDialogFormOwnProps,
) => ({
  initialValues: getInitialValuesForSetAccessPolicyForm(
    ownProps.offering?.organization_groups ||
      ownProps.plan?.organization_groups ||
      ownProps.customer?.organization_groups,
  ),
});

const connector = connect(mapStateToProps);

const enhance = compose(
  connector,
  reduxForm<SetAccessPolicyDialogFormOwnProps>({
    form: SET_ACCESS_POLICY_FORM_ID,
  }),
);

export const SetAccessPolicyDialogForm = enhance(PureSetAccessPolicyDialogForm);
