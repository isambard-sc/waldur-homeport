import { DateTime } from 'luxon';
import { FunctionComponent, useCallback } from 'react';
import { OptionProps, components } from 'react-select';
import { connect, useDispatch } from 'react-redux';
import { Field, reduxForm } from 'redux-form';
import {
  CustomerUser,
  NestedProjectPermission,
  projectsAddUser,
  projectsDeleteUser,
  projectsUpdateUser,
} from 'waldur-js-client';

import { SubmitButton } from '@waldur/auth/SubmitButton';
import { required } from '@waldur/core/validators';
import { DateField } from '@waldur/form/DateField';
import { FormContainer } from '@waldur/form';
import { SelectField } from '@waldur/form/SelectField';
import { translate } from '@waldur/i18n';
import { FormGroup } from '@waldur/marketplace/offerings/FormGroup';
import { closeModalDialog } from '@waldur/modal/actions';
import { CloseDialogButton } from '@waldur/modal/CloseDialogButton';
import { ModalDialog } from '@waldur/modal/ModalDialog';
import { Role, RoleType } from '@waldur/permissions/types';
import { getProjectRoles, getRoles } from '@waldur/permissions/utils';
import { showErrorResponse } from '@waldur/store/notify';

import { ProjectGroup } from './ProjectGroup';
import { UserGroup } from './UserGroup';

const FORM_ID = 'EditProjectUserDialog';

// Redux-form compatible RoleGroup component
const renderRoleType = (roleType: RoleType) =>
  ({
    customer: 'O',
    project: 'P',
    service_provider: 'SP',
    call_organizer: 'CO',
  })[roleType] || '';

const RoleOption: FunctionComponent<OptionProps<Role>> = (props) => (
  <components.Option {...props}>
    <div style={{ display: 'flex', justifyContent: 'space-between' }}>
      {props.data.description || props.data.name}
      <span
        style={{
          alignSelf: 'center',
          marginLeft: 'auto',
        }}
      >
        {renderRoleType(props.data.content_type)}
      </span>
    </div>
  </components.Option>
);

const RoleGroup: FunctionComponent<{ types: RoleType[] }> = ({ types }) => (
  <FormGroup label={translate('Role')}>
    <Field
      name="role"
      component={SelectField as any}
      options={getRoles(types)}
      getOptionLabel={(role: Role) => role.description || role.name}
      getOptionValue={({ name }) => name}
      validate={required}
      components={{ Option: RoleOption }}
    />
  </FormGroup>
);

// Redux-form compatible ExpirationTimeGroup component
const ExpirationTimeGroup: FunctionComponent<{ disabled?: boolean }> = ({
  disabled,
}) => (
  <FormGroup
    id="expiration-time-group"
    label={translate('Role expires on')}
    spaceless
  >
    <Field
      name="expiration_time"
      component={DateField as any}
      disabled={disabled}
      minDate={DateTime.now().plus({ days: 1 }).toISO()}
      placeholder="YYYY-MM-DD"
    />
  </FormGroup>
);

interface EditProjectUserDialogFormData {
  role: Role;
  expiration_time: string;
}

interface EditProjectUserDialogResolve {
  project: NestedProjectPermission;
  customer: CustomerUser;
  refetch;
}

interface EditProjectUserDialogOwnProps {
  resolve: EditProjectUserDialogResolve;
}

const savePermissions = async (
  formData: EditProjectUserDialogFormData,
  resolve: EditProjectUserDialogResolve,
) => {
  if (resolve.project.role_name === formData.role.name) {
    await projectsUpdateUser({
      path: { uuid: resolve.project.uuid },
      body: {
        user: resolve.customer.uuid,
        role: formData.role.name,
        expiration_time: formData.expiration_time,
      },
    });
  } else {
    await projectsDeleteUser({
      path: { uuid: resolve.project.uuid },
      body: {
        user: resolve.customer.uuid,
        role: resolve.project.role_name,
      },
    });
    await projectsAddUser({
      path: { uuid: resolve.project.uuid },
      body: {
        user: resolve.customer.uuid,
        role: formData.role.name,
        expiration_time: formData.expiration_time,
      },
    });
  }
  await resolve.refetch();
};

export const EditProjectUserDialog = connect(
  (_, ownProps: EditProjectUserDialogOwnProps) => ({
    initialValues: {
      role: getProjectRoles().find(
        ({ name }) => name === ownProps.resolve.project.role_name,
      ),
      expiration_time: ownProps.resolve.project.expiration_time,
    },
  }),
)(
  reduxForm<EditProjectUserDialogFormData, EditProjectUserDialogOwnProps>({
    form: FORM_ID,
  })(({ submitting, handleSubmit, resolve }) => {
    const dispatch = useDispatch();

    const saveUser = useCallback(
      async (formData) => {
        try {
          await savePermissions(formData, resolve);
          dispatch(closeModalDialog());
        } catch (error) {
          dispatch(
            showErrorResponse(error, translate('Unable to update permission.')),
          );
        }
      },
      [dispatch, resolve],
    );

    return (
      <form onSubmit={handleSubmit(saveUser)}>
        <ModalDialog
          title={translate('Edit project member')}
          footer={
            <>
              <CloseDialogButton />
              <SubmitButton submitting={submitting}>
                {translate('Save')}
              </SubmitButton>
            </>
          }
        >
          <FormContainer submitting={submitting}>
            <UserGroup permission={resolve.customer} />
            <ProjectGroup project={resolve.project} />
            <RoleGroup types={['project']} />
            <ExpirationTimeGroup disabled={submitting} />
          </FormContainer>
        </ModalDialog>
      </form>
    );
  }),
);
