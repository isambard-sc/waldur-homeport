import { PlusIcon, UserCirclePlusIcon } from '@phosphor-icons/react';
import { FC, useCallback, useState } from 'react';
import { Form } from 'react-final-form';
import { components } from 'react-select';
import { useDispatch } from 'react-redux';
import { RoleDetails } from 'waldur-js-client';

import { post } from '@waldur/core/api';
import { ENV } from '@waldur/core/config';
import { required } from '@waldur/core/validators';
import { usersAutocomplete } from '@waldur/customer/team/utils';
import { UserFeatures } from '@waldur/FeaturesEnums';
import { isFeatureVisible } from '@waldur/features/connect';
import { SubmitButton } from '@waldur/form';
import { AsyncSelectFieldFinal } from '@waldur/form/AsyncSelectField';
import { translate } from '@waldur/i18n';
import { FormGroup } from '@waldur/marketplace/offerings/FormGroup';
import { CloseDialogButton } from '@waldur/modal/CloseDialogButton';
import { useModal } from '@waldur/modal/hooks';
import { ModalDialog } from '@waldur/modal/ModalDialog';
import { openModalDialog } from '@waldur/modal/actions';
import { RoleEnum } from '@waldur/permissions/enums';
import { ExpirationTimeGroup } from '@waldur/project/team/ExpirationTimeGroup';
import { RoleGroup } from '@waldur/project/team/RoleGroup';
import { UserListOptionInline } from '@waldur/project/team/UserListOptionInline';
import { useNotify } from '@waldur/store/hooks';
import { getCurrentUser } from '@waldur/user/UsersService';
import { setCurrentUser } from '@waldur/workspace/actions';
import { useUser } from '@waldur/workspace/hooks';

import { CreateUserDialog } from './CreateUserDialog';
import { OwnershipTransferDialog } from './OwnershipTransferDialog';
import { AddUserDialogProps } from './types';

interface AddUserDialogFormData {
  role: RoleDetails;
  expiration_time: string;
  user: any;
}

const getOptionLabel = (option) =>
  option.email
    ? (option.full_name || option.username) + ` (${option.email})`
    : option.full_name || option.username;

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

export const AddUserDialog: FC<AddUserDialogProps> = ({
  refetch,
  scope,
  roleTypes,
  roles,
}) => {
  const dispatch = useDispatch();
  const { showSuccess, showErrorResponse } = useNotify();
  const { closeDialog } = useModal();
  const [selectKey, setSelectKey] = useState(0);
  const currentUser = useUser();

  const handleUserCreated = (user: any, form) => {
    // Set the newly created user in the form
    form.change('user', user);
    // Force re-render of the select component
    setSelectKey((prev) => prev + 1);
  };

  const openCreateUserDialog = (form) => {
    // Use SHOW_CONFIRM type to overlay on top of current modal
    // This prevents closing the AddUserDialog when CreateUserDialog opens
    dispatch(
      openModalDialog(
        CreateUserDialog,
        {
          onUserCreated: (user) => handleUserCreated(user, form),
        },
        'SHOW_CONFIRM',
      ),
    );
  };

  const performAddUser = useCallback(
    async (formData: AddUserDialogFormData) => {
      const selectedRole =
        roles && roles.length === 1 ? roles[0] : formData.role.name;

      const response = await post(`${scope.url}add_user/`, {
        user: formData.user.uuid,
        expiration_time: formData.expiration_time,
        role: selectedRole,
      });

      const responseData = await response.json();

      await refetch();

      // Check if ownership was transferred
      if (responseData?.ownership_transferred) {
        // Refresh the current user's permissions if they were involved in the transfer
        // This ensures the UI updates correctly (e.g., old manager sees member view)
        if (
          currentUser.uuid === formData.user.uuid ||
          selectedRole === RoleEnum.PROPOSAL_MANAGER
        ) {
          const newUser = await getCurrentUser();
          dispatch(setCurrentUser(newUser));
        }

        showSuccess(
          translate('Ownership transferred from {previous} to {new}.', {
            previous: responseData.previous_manager,
            new: responseData.new_manager,
          }),
        );
      } else {
        showSuccess(translate('User has been added.'));
      }

      closeDialog();
    },
    [scope, roles, refetch, showSuccess, closeDialog, currentUser, dispatch],
  );

  const saveUser = useCallback(
    async (formData: AddUserDialogFormData) => {
      try {
        const selectedRole =
          roles && roles.length === 1 ? roles[0] : formData.role.name;

        // Check if the role being assigned is MANAGER
        if (selectedRole === RoleEnum.PROPOSAL_MANAGER) {
          // Show ownership transfer confirmation dialog
          dispatch(
            openModalDialog(
              OwnershipTransferDialog,
              {
                currentManager: {
                  full_name: currentUser.full_name,
                  email: currentUser.email,
                  username: currentUser.username,
                },
                newManager: {
                  full_name: formData.user.full_name,
                  email: formData.user.email,
                  username: formData.user.username,
                },
                onConfirm: async () => {
                  try {
                    await performAddUser(formData);
                  } catch (error) {
                    showErrorResponse(
                      error,
                      translate('Unable to transfer ownership.'),
                    );
                  }
                },
              },
              'SHOW_CONFIRM',
            ),
          );
        } else {
          await performAddUser(formData);
        }
      } catch (error) {
        showErrorResponse(error, translate('Unable to add user.'));
      }
    },
    [
      scope,
      roles,
      currentUser,
      dispatch,
      performAddUser,
      showErrorResponse,
    ],
  );

  const initialValues =
    roles && roles.length === 1
      ? { role: ENV.roles.find((role) => role.name === roles[0]) }
      : {};

  return (
    <Form onSubmit={saveUser} initialValues={initialValues}>
      {({ handleSubmit, submitting, invalid, form }) => (
        <form onSubmit={handleSubmit}>
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
            <FormGroup label={translate('User')} required>
              <AsyncSelectFieldFinal
                key={selectKey}
                name="user"
                placeholder={translate('Search and select user...')}
                loadOptions={(query, prevOptions, page) =>
                  usersAutocomplete({ query }, prevOptions, page)
                }
                getOptionValue={(option) => option.uuid}
                getOptionLabel={getOptionLabel}
                components={{
                  Option: UserListOptionInline,
                  ...(isFeatureVisible(UserFeatures.allow_user_creation) && {
                    Menu: (props) => (
                      <MenuWithCreateButton
                        {...props}
                        openCreateDialog={() => openCreateUserDialog(form)}
                      />
                    ),
                  }),
                }}
                validate={required}
              />
            </FormGroup>

            {roles && roles.length === 1 ? null : (
              <RoleGroup types={roleTypes} />
            )}
            <ExpirationTimeGroup />
          </ModalDialog>
        </form>
      )}
    </Form>
  );
};
