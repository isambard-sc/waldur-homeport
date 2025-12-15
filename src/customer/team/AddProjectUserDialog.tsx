import { DateTime } from 'luxon';
import { FunctionComponent } from 'react';
import { OptionProps, components } from 'react-select';
import { useDispatch, useSelector } from 'react-redux';
import { Field, reduxForm } from 'redux-form';
import { CustomerUser, Project, projectsAddUser } from 'waldur-js-client';

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
import { getRoles } from '@waldur/permissions/utils';
import { showErrorResponse } from '@waldur/store/notify';
import { getCustomer } from '@waldur/workspace/selectors';

import { UserGroup } from './UserGroup';
import { useCustomerProjects } from '../workspace/fetchCustomer';

const FORM_ID = 'AddProjectUserDialog';

// Redux-form compatible OrganizationProjectSelectField component
const OrganizationProjectSelectField = ({ disabled = false }) => {
  const currentCustomer = useSelector(getCustomer);
  const { loading } = useCustomerProjects();

  return (
    <FormGroup label={translate('Project')} required>
      <Field
        name="project"
        component={SelectField as any}
        options={currentCustomer?.projects}
        getOptionLabel={(option) => option.name}
        getOptionValue={(option) => option.url}
        isClearable={false}
        isDisabled={disabled}
        isLoading={loading}
        validate={required}
      />
    </FormGroup>
  );
};

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

interface AddProjectUserDialogFormData {
  role: Role;
  expiration_time: string;
  project: Project;
}

interface AddProjectUserDialogResolve {
  customer: CustomerUser;
  refetch;
}

interface AddProjectUserDialogOwnProps {
  resolve: AddProjectUserDialogResolve;
}

export const AddProjectUserDialog = reduxForm<
  AddProjectUserDialogFormData,
  AddProjectUserDialogOwnProps
>({
  form: FORM_ID,
})(({ submitting, handleSubmit, resolve }) => {
  const dispatch = useDispatch();

  return (
    <form
      onSubmit={handleSubmit(async (formData) => {
        try {
          await projectsAddUser({
            path: { uuid: formData.project.uuid },
            body: {
              user: resolve.customer.uuid,
              role: formData.role.name,
              expiration_time: formData.expiration_time,
            },
          });
          await resolve.refetch();
          dispatch(closeModalDialog());
        } catch (error) {
          dispatch(
            showErrorResponse(error, translate('Unable to update permission.')),
          );
        }
      })}
    >
      <ModalDialog
        title={translate('Add project role')}
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
          <OrganizationProjectSelectField />
          <RoleGroup types={['project']} />
          <ExpirationTimeGroup disabled={submitting} />
        </FormContainer>
      </ModalDialog>
    </form>
  );
});
