import { PlusIcon, UserPlusIcon } from '@phosphor-icons/react';
import { FC, useCallback, useMemo, useState } from 'react';
import { Field, Form } from 'react-final-form';
import { components } from 'react-select';
import { useDispatch, useSelector } from 'react-redux';
import {
  callManagingOrganisationsAddUser,
  customersAddUser,
  customersUsersList,
  CustomersUsersListData,
  marketplaceServiceProvidersAddUser,
  projectsAddUser,
  projectsOtherUsersList,
  ProjectsOtherUsersListData,
} from 'waldur-js-client';

import { parseSelectData } from '@waldur/core/api';
import { ENV } from '@waldur/core/config';
import { returnReactSelectAsyncPaginateObject } from '@waldur/core/utils';
import { required } from '@waldur/core/validators';
import { isEmailAllowed } from '@waldur/openportal/bindings/helpers';
import { useProjectEmailPolicy } from '@waldur/project/useProjectEmailPolicy';
import { OrganizationProjectSelectField } from '@waldur/customer/team/OrganizationProjectSelectField';
import { usersAutocomplete } from '@waldur/customer/team/utils';
import { UserFeatures } from '@waldur/FeaturesEnums';
import { isFeatureVisible } from '@waldur/features/connect';
import { SubmitButton } from '@waldur/form';
import { AsyncSelectFieldFinal } from '@waldur/form/AsyncSelectField';
import { AwesomeCheckboxField } from '@waldur/form/AwesomeCheckboxField';
import { translate } from '@waldur/i18n';
import { FormGroup } from '@waldur/marketplace/offerings/FormGroup';
import { CloseDialogButton } from '@waldur/modal/CloseDialogButton';
import { useModal } from '@waldur/modal/hooks';
import { ModalDialog } from '@waldur/modal/ModalDialog';
import { openModalDialog } from '@waldur/modal/actions';
import { PermissionEnum } from '@waldur/permissions/enums';
import { hasPermission } from '@waldur/permissions/hasPermission';
import { Role, RoleType } from '@waldur/permissions/types';
import { CreateUserDialog } from '@waldur/proposals/team/CreateUserDialog';
import { useNotify } from '@waldur/store/hooks';
import { getCurrentUser } from '@waldur/user/UsersService';
import { setCurrentUser } from '@waldur/workspace/actions';
import { useUser } from '@waldur/workspace/hooks';
import { getCustomer, getProject } from '@waldur/workspace/selectors';
import { Project, User } from '@waldur/workspace/types';

import { DomainRestrictionNotice } from './DomainRestrictionNotice';
import { ExpirationTimeGroup } from './ExpirationTimeGroup';
import { RoleGroup } from './RoleGroup';
import { UserListOptionInline } from './UserListOptionInline';
import { hasCurrentCustomerPermission } from './utils';

interface AddUserDialogFormData {
  role: Role;
  expiration_time: string;
  user: any;
  project?: Project;
  showAllUsers?: boolean;
}

interface AddUserDialogProps {
  refetch;
  level?: RoleType;
  title?: string;
}

const customerUsersAutocomplete = async (
  customerUuid: string,
  query: CustomersUsersListData['query'],
  prevOptions,
  currentPage: number,
) => {
  const response = await customersUsersList({
    path: { customer_uuid: customerUuid },
    query: {
      o: 'concatenated_name',
      ...query,
      page: currentPage,
      page_size: ENV.pageSize,
    },
  });
  return returnReactSelectAsyncPaginateObject(
    parseSelectData(response),
    prevOptions,
    currentPage,
  );
};

const projectUsersAutocomplete = async (
  projectUuid: string,
  query: ProjectsOtherUsersListData['query'],
  prevOptions,
  currentPage: number,
) => {
  const response = await projectsOtherUsersList({
    path: { project_uuid: projectUuid },
    query: {
      ...query,
      page: currentPage,
      page_size: ENV.pageSize,
    },
  });
  return returnReactSelectAsyncPaginateObject(
    parseSelectData(response),
    prevOptions,
    currentPage,
  );
};

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
  level,
  title,
}) => {
  const dispatch = useDispatch();
  const { closeDialog } = useModal();
  const { showSuccess, showErrorResponse } = useNotify();
  const [selectKey, setSelectKey] = useState(0);

  const currentUser = useUser() as User;
  const currentProject = useSelector(getProject);
  const currentCustomer = useSelector(getCustomer);
  const hasCustomerPermission = useSelector(hasCurrentCustomerPermission);

  const { data: emailPolicy } = useProjectEmailPolicy(
    level === 'project' ? currentProject?.uuid : undefined,
  );

  const userEmailValidator = useMemo(() => {
    if (!emailPolicy) return undefined;
    const { allowed_domains: domains } = emailPolicy;
    return (user: any) => {
      if (!user?.email) return undefined;
      return isEmailAllowed(domains, user.email)
        ? undefined
        : translate('This user\'s email address is not permitted for this project.');
    };
  }, [emailPolicy]);

  const loadUsers = useCallback(
    async (query, prevOptions, page, showAllUsers: boolean) => {
      try {
        if (showAllUsers) {
          return await usersAutocomplete({ query }, prevOptions, page);
        }

        if (hasCustomerPermission || !currentProject) {
          return await customerUsersAutocomplete(
            currentCustomer.uuid,
            { user_keyword: query },
            prevOptions,
            page,
          );
        }

        return await projectUsersAutocomplete(
          currentProject.uuid,
          { user_keyword: query },
          prevOptions,
          page,
        );
      } catch (error) {
        showErrorResponse(error, translate('Unable to load users.'));
        return {
          options: [],
          hasMore: false,
          additional: { page: 1 },
        };
      }
    },
    [
      hasCustomerPermission,
      currentProject,
      currentCustomer.uuid,
      showErrorResponse,
    ],
  );

  const getOptionLabel = (option) =>
    option.email
      ? (option.full_name || option.username) + ` (${option.email})`
      : option.full_name || option.username;

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

  const saveUser = useCallback(
    async (formData: AddUserDialogFormData) => {
      if (formData.role.content_type === 'project') {
        try {
          await projectsAddUser({
            path: {
              uuid: formData.project
                ? formData.project.uuid
                : currentProject.uuid,
            },
            body: {
              user: formData.user.uuid,
              expiration_time: formData.expiration_time,
              role: formData.role.name,
            },
          });
          await refetch();
          showSuccess('User has been added to project.');
          closeDialog();
        } catch (error) {
          showErrorResponse(error, translate('Unable to add user.'));
        }
      } else if (formData.role.content_type === 'customer') {
        try {
          await customersAddUser({
            path: { uuid: currentCustomer.uuid },
            body: {
              user: formData.user.uuid,
              role: formData.role.name,
              expiration_time: formData.expiration_time,
            },
          });
          if (currentUser.uuid === formData.user.uuid) {
            const newUser = await getCurrentUser();
            dispatch(setCurrentUser(newUser));
          }
          await refetch();
          showSuccess('User has been added to organization.');
          closeDialog();
        } catch (error) {
          showErrorResponse(error, translate('Unable to add user.'));
        }
      } else if (formData.role.content_type === 'call_organizer') {
        try {
          await callManagingOrganisationsAddUser({
            path: { uuid: currentCustomer.call_managing_organization_uuid },
            body: {
              user: formData.user.uuid,
              role: formData.role.name,
              expiration_time: formData.expiration_time,
            },
          });
          if (currentUser.uuid === formData.user.uuid) {
            const newUser = await getCurrentUser();
            dispatch(setCurrentUser(newUser));
          }
          await refetch();
          showSuccess('User has been added to organization.');
          closeDialog();
        } catch (error) {
          showErrorResponse(error, translate('Unable to add user.'));
        }
      } else if (formData.role.content_type === 'service_provider') {
        try {
          await marketplaceServiceProvidersAddUser({
            path: { uuid: currentCustomer.service_provider_uuid },
            body: {
              user: formData.user.uuid,
              role: formData.role.name,
              expiration_time: formData.expiration_time,
            },
          });
          if (currentUser.uuid === formData.user.uuid) {
            const newUser = await getCurrentUser();
            dispatch(setCurrentUser(newUser));
          }
          await refetch();
          showSuccess('User has been added to organization.');
          closeDialog();
        } catch (error) {
          showErrorResponse(error, translate('Unable to add user.'));
        }
      }
    },
    [
      refetch,
      showSuccess,
      closeDialog,
      showErrorResponse,
      currentProject,
      currentCustomer,
      currentUser,
      dispatch,
    ],
  );

  return (
    <Form onSubmit={saveUser}>
      {({ handleSubmit, submitting, invalid, values, form }) => (
        <form onSubmit={handleSubmit}>
          <ModalDialog
            title={title || translate('Add user')}
            footer={
              <>
                <CloseDialogButton />
                <SubmitButton submitting={submitting} disabled={invalid}>
                  {translate('Add role')}
                </SubmitButton>
              </>
            }
            iconNode={<UserPlusIcon weight="bold" />}
            iconColor="success"
          >
            <DomainRestrictionNotice
              allowedDomains={emailPolicy?.allowed_domains}
              contactEmail={currentCustomer.email}
              projectName={currentProject?.name}
            />
            <FormGroup label={translate('User')} required>
              <AsyncSelectFieldFinal
                name="user"
                key={
                  values.showAllUsers
                    ? `showAllUsers-${selectKey}`
                    : `notShowAllUsers-${selectKey}`
                }
                placeholder={translate('Select user...')}
                loadOptions={(query, prevOptions, page) =>
                  loadUsers(
                    query,
                    prevOptions,
                    page,
                    values.showAllUsers || false,
                  )
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
                required={true}
                validate={(value) =>
                  required(value) || userEmailValidator?.(value)
                }
              />
            </FormGroup>

            {currentUser.is_staff && (
              <FormGroup>
                <Field
                  name="showAllUsers"
                  component={AwesomeCheckboxField as any}
                  label={translate('Show users outside organization')}
                />
              </FormGroup>
            )}
            <RoleGroup
              types={
                level === 'customer' &&
                hasPermission(currentUser, {
                  permission: PermissionEnum.CREATE_CUSTOMER_PERMISSION,
                  customerId: currentCustomer.uuid,
                })
                  ? ['customer', 'project']
                  : [level]
              }
            />

            {level === 'customer' &&
              values.role?.content_type === 'project' && (
                <OrganizationProjectSelectField />
              )}
            <ExpirationTimeGroup />
          </ModalDialog>
        </form>
      )}
    </Form>
  );
};
