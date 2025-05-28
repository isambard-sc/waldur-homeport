import { PencilSimple, PlusCircle } from '@phosphor-icons/react';
import { useCallback, useMemo } from 'react';
import { useDispatch } from 'react-redux';
import { reduxForm } from 'redux-form';
import {
  CustomerServiceAccount,
  CustomerServiceAccountRequest,
  marketplaceCustomerServiceAccountsCreate,
  marketplaceCustomerServiceAccountsPartialUpdate,
  marketplaceProjectServiceAccountsCreate,
  marketplaceProjectServiceAccountsPartialUpdate,
  ProjectServiceAccount,
  ProjectServiceAccountRequest,
} from 'waldur-js-client';

import {
  FormContainer,
  StringField,
  SubmitButton,
  TextField,
} from '@waldur/form';
import { translate } from '@waldur/i18n';
import { closeModalDialog } from '@waldur/modal/actions';
import { CloseDialogButton } from '@waldur/modal/CloseDialogButton';
import { ModalDialog } from '@waldur/modal/ModalDialog';
import { showErrorResponse, showSuccess } from '@waldur/store/notify';

import { ServiceAccountsProps } from './type';

interface OwnProps {
  resolve: ServiceAccountsProps & {
    refetch(): void;
    row?: CustomerServiceAccount | ProjectServiceAccount;
  };
}

interface ServiceAccountFormData {
  username: string;
  email: string;
  description: string;
}

export const ServiceAccountFormDialog = reduxForm<
  ServiceAccountFormData,
  OwnProps
>({
  form: 'SERVICE_ACCOUNT_FORM_ID',
})(({
  resolve: { row, context, scope, refetch },
  submitting,
  handleSubmit,
}) => {
  const dispatch = useDispatch();

  const isEdit = useMemo(() => !!row?.uuid, [row]);

  const save = useCallback(
    async (formData: ServiceAccountFormData) => {
      try {
        const body =
          context === 'customer'
            ? ({
                ...formData,
                customer: scope.uuid,
              } as CustomerServiceAccountRequest)
            : ({
                ...formData,
                project: scope.uuid,
              } as ProjectServiceAccountRequest);

        if (isEdit) {
          const api =
            context === 'customer'
              ? marketplaceCustomerServiceAccountsPartialUpdate
              : marketplaceProjectServiceAccountsPartialUpdate;
          await api({
            path: { uuid: row.uuid },
            body,
          });
        } else {
          const api =
            context === 'customer'
              ? marketplaceCustomerServiceAccountsCreate
              : marketplaceProjectServiceAccountsCreate;
          await api({ body } as any);
        }
        dispatch(
          showSuccess(
            isEdit
              ? translate('Service account has been updated.')
              : translate('Service account has been created.'),
          ),
        );
        if (refetch) refetch();
        dispatch(closeModalDialog());
      } catch (e) {
        dispatch(
          showErrorResponse(
            e,
            isEdit
              ? translate('Unable to edit service account.')
              : translate("'Unable to create service account.'"),
          ),
        );
      }
    },
    [dispatch, scope, refetch, isEdit, row],
  );

  return (
    <form onSubmit={handleSubmit(save)}>
      <ModalDialog
        title={
          isEdit
            ? translate('Edit service account')
            : translate('Create service account')
        }
        iconNode={
          isEdit ? <PencilSimple weight="bold" /> : <PlusCircle weight="bold" />
        }
        iconColor="success"
        closeButton
        footer={
          <>
            <CloseDialogButton className="min-w-125px" />
            <SubmitButton
              submitting={submitting}
              label={isEdit ? translate('Save') : translate('Create')}
              className="btn btn-primary min-w-125px"
            />
          </>
        }
      >
        <FormContainer submitting={submitting}>
          <StringField
            name="username"
            label={translate('Preferred identifier')}
            placeholder={translate('e.g.') + ' backup'}
            autoFocus
            description={translate(
              'Suggest an identifier to include into the generated username of the service account.',
            )}
          />
          <StringField
            name="email"
            label={translate('Notification email')}
            placeholder={translate('e.g.') + ' serviceaccount@example.com'}
            description={translate(
              'Email for receiving notifications about events connected with the service account.',
            )}
          />
          <TextField
            name="description"
            label={translate('Description')}
            placeholder={translate('e.g. Used for automated backups')}
          />
        </FormContainer>
      </ModalDialog>
    </form>
  );
});
