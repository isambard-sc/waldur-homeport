import { PlusIcon, UserCirclePlusIcon } from '@phosphor-icons/react';
import { useState } from 'react';
import { components } from 'react-select';
import { useDispatch } from 'react-redux';
import { reduxForm } from 'redux-form';
import { RoleDetails } from 'waldur-js-client';

import { post } from '@waldur/core/api';
import { required } from '@waldur/core/validators';
import { usersAutocomplete } from '@waldur/customer/team/utils';
import { FormContainer, SubmitButton } from '@waldur/form';
import { AsyncSelectField } from '@waldur/form/AsyncSelectField';
import { translate } from '@waldur/i18n';
import { openModalDialog } from '@waldur/modal/actions';
import { CloseDialogButton } from '@waldur/modal/CloseDialogButton';
import { useModal } from '@waldur/modal/hooks';
import { ModalDialog } from '@waldur/modal/ModalDialog';
import { ExpirationTimeGroup } from '@waldur/project/team/ExpirationTimeGroup';
import { RoleGroup } from '@waldur/project/team/RoleGroup';
import { UserListOptionInline } from '@waldur/project/team/UserListOptionInline';
import { useNotify } from '@waldur/store/hooks';

import { CreateUserDialog } from './CreateUserDialog';
import { AddUserDialogProps } from './types';

const FORM_ID = 'AddUserDialog';

interface AddUserDialogFormData {
  role: RoleDetails;
  expiration_time: string;
  user: any;
}

// Custom Menu component with "Create user" button
const MenuWithCreateButton = ({ openCreateDialog, ...props }) => {
  return (
    <>
      <components.Menu {...props}>
        <div>
          {props.children}
          <div
            style={{
              borderTop: '1px solid #e0e0e0',
              padding: '8px 12px',
              cursor: 'pointer',
              display: 'flex',
              alignItems: 'center',
              gap: '8px',
              color: '#009ef7',
              fontWeight: 500,
            }}
            onMouseDown={(e) => {
              e.preventDefault();
              e.stopPropagation();
              openCreateDialog();
            }}
          >
            <PlusIcon size={16} weight="bold" />
            <span>{translate('Create user')}</span>
          </div>
        </div>
      </components.Menu>
    </>
  );
};

export const AddUserDialog = reduxForm<
  AddUserDialogFormData,
  AddUserDialogProps
>({
  form: FORM_ID,
})(({
  submitting,
  handleSubmit,
  refetch,
  invalid,
  scope,
  roleTypes,
  roles,
  change,
}) => {
  const dispatch = useDispatch();
  const { showSuccess, showErrorResponse } = useNotify();
  const { closeDialog } = useModal();
  const [selectKey, setSelectKey] = useState(0);

  const getOptionLabel = (option) =>
    option.email
      ? (option.full_name || option.username) + ` (${option.email})`
      : option.full_name || option.username;

  const handleUserCreated = (user: any) => {
    // Set the newly created user in the form
    change('user', user);
    // Force re-render of the select component
    setSelectKey((prev) => prev + 1);
    // Close only the CreateUserDialog (HIDE_CONFIRM), not the AddUserDialog
    closeDialog('HIDE_CONFIRM');
  };

  const openCreateUserDialog = () => {
    // Use SHOW_CONFIRM type to overlay on top of current modal
    // This prevents closing the AddUserDialog when CreateUserDialog opens
    dispatch(
      openModalDialog(
        CreateUserDialog,
        {
          onUserCreated: handleUserCreated,
        },
        'SHOW_CONFIRM',
      ),
    );
  };

  const saveUser = async (formData: AddUserDialogFormData) => {
    try {
      await post(`${scope.url}add_user/`, {
        user: formData.user.uuid,
        expiration_time: formData.expiration_time,
        role: roles && roles.length === 1 ? roles[0] : formData.role.name,
      });

      await refetch();
      showSuccess('User has been added.');
      closeDialog();
    } catch (error) {
      showErrorResponse(error, translate('Unable to add user.'));
    }
  };

  return (
    <form onSubmit={handleSubmit(saveUser)}>
      <ModalDialog
        title={translate('Add member')}
        subtitle={translate(
          'Select a user to assign a role within the project.',
        )}
        iconNode={<UserCirclePlusIcon weight="bold" />}
        iconColor="success"
        footer={
          <>
            <CloseDialogButton className="min-w-125px" />
            <SubmitButton
              label={translate('Add role')}
              submitting={submitting}
              disabled={invalid}
              className="btn btn-primary min-w-125px"
            />
          </>
        }
      >
        <FormContainer submitting={submitting}>
          <AsyncSelectField
            key={selectKey}
            name="user"
            label={translate('User')}
            placeholder={translate('Search and select user...')}
            loadOptions={(query, prevOptions, page) =>
              usersAutocomplete({ query }, prevOptions, page)
            }
            getOptionValue={(option) => option.uuid}
            getOptionLabel={getOptionLabel}
            components={{
              Option: UserListOptionInline,
              Menu: (props) => (
                <MenuWithCreateButton
                  {...props}
                  openCreateDialog={openCreateUserDialog}
                />
              ),
            }}
            required={true}
            validate={[required]}
          />

          {roles && roles.length === 1 ? null : <RoleGroup types={roleTypes} />}
          <ExpirationTimeGroup />
        </FormContainer>
      </ModalDialog>
    </form>
  );
});
