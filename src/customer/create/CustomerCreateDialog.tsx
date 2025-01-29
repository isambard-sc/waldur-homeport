import { PlusCircle } from '@phosphor-icons/react';
import { useRouter } from '@uirouter/react';
import { FC, useCallback } from 'react';
import { Form } from 'react-final-form';
import { useDispatch, useSelector } from 'react-redux';
import { reset, SubmissionError } from 'redux-form';

import { ENV } from '@waldur/configs/default';
import { sendForm } from '@waldur/core/api';
import { SubmitButton } from '@waldur/form';
import { translate } from '@waldur/i18n';
import { CloseDialogButton } from '@waldur/modal/CloseDialogButton';
import { MetronicModalDialog } from '@waldur/modal/MetronicModalDialog';
import { addCustomerUser } from '@waldur/permissions/api';
import { RoleEnum } from '@waldur/permissions/enums';
import { showErrorResponse, showSuccess } from '@waldur/store/notify';
import { getCurrentUser } from '@waldur/user/UsersService';
import { setCurrentUser } from '@waldur/workspace/actions';
import { getUser } from '@waldur/workspace/selectors';
import { Customer } from '@waldur/workspace/types';

import * as constants from './constants';
import { CustomerCreateForm } from './CustomerCreateForm';
import { CustomerCreateFormData } from './types';

const CUSTOMER_FIELDS = ['name', 'email'];

interface OwnProps {
  resolve: { role: string };
}

export const CustomerCreateDialog: FC<OwnProps> = ({ resolve }) => {
  const dispatch = useDispatch();
  const user = useSelector(getUser);
  const router = useRouter();

  const createOrganization = useCallback(
    async (formData: CustomerCreateFormData) => {
      const payload: Record<string, string | boolean> = {};
      CUSTOMER_FIELDS.forEach((field) => {
        if (formData[field]) {
          payload[field] = formData[field];
        }
      });
      try {
        const response = await sendForm<Customer>(
          'POST',
          `${ENV.apiEndpoint}api/customers/`,
          payload,
        );
        const customer = response.data;
        if (resolve.role === constants.ROLES.provider) {
          await addCustomerUser({
            customer: customer.uuid,
            role: RoleEnum.CUSTOMER_OWNER,
            user: user.uuid,
          });
        }
        dispatch(showSuccess(translate('Organization has been created.')));
        const newUser = await getCurrentUser();
        dispatch(setCurrentUser(newUser));
        router.stateService.go('organization-manage', {
          uuid: customer.uuid,
        });
        dispatch(reset('CustomerCreateDialog'));
      } catch (e) {
        dispatch(
          showErrorResponse(e, translate('Could not create organization')),
        );
        if (e.status === 400) {
          throw new SubmissionError(e.data);
        }
      }
    },
    [dispatch, router, user, resolve.role],
  );
  return (
    <Form
      onSubmit={createOrganization}
      render={({ handleSubmit, submitting, invalid }) => (
        <form onSubmit={handleSubmit}>
          <MetronicModalDialog
            title={translate('Create an organization')}
            subtitle={translate(
              'Provide the required information to create a new organization.',
            )}
            iconNode={<PlusCircle weight="bold" />}
            iconColor="success"
            footer={
              <>
                <CloseDialogButton className="min-w-125px" />
                <SubmitButton
                  submitting={submitting}
                  disabled={invalid}
                  label={translate('Create')}
                  className="btn btn-primary min-w-125px"
                />
              </>
            }
          >
            <CustomerCreateForm />
          </MetronicModalDialog>
        </form>
      )}
    />
  );
};
