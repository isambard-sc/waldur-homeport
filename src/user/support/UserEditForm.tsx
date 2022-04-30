import { FunctionComponent } from 'react';
import { Form } from 'react-bootstrap';
import { InjectedFormProps, reduxForm } from 'redux-form';

import {
  FieldError,
  FormContainer,
  StringField,
  SubmitButton,
} from '@waldur/form';
import { translate, TranslateProps } from '@waldur/i18n';
import { StaticField } from '@waldur/user/support/StaticField';
import {
  formatRegistrationMethod,
  formatUserStatus,
} from '@waldur/user/support/utils';
import { UserDetails } from '@waldur/workspace/types';

import { EmailField } from './EmailField';
import { TermsOfService } from './TermsOfService';

interface UserEditFormData {
  full_name: string;
  email: string;
  registration_method?: string;
  user_status?: string;
  id_code?: string;
  organization: string;
  job_position: string;
  description: string;
  phone_number: string;
  token: string;
}

interface UserEditFormProps extends TranslateProps, InjectedFormProps {
  updateUser(data: UserEditFormData): Promise<void>;
  showUserRemoval: () => void;
  initial?: boolean;
  isVisibleForSupportOrStaff: boolean;
  userTokenIsVisible: boolean;
  fieldIsVisible: (field: string) => boolean;
  isRequired: (field: string) => boolean;
  nativeNameIsVisible: () => boolean;
  showDeleteButton: boolean;
  user: UserDetails;
  protected?: boolean;
}

export const PureUserEditForm: FunctionComponent<UserEditFormProps> = (
  props,
) => (
  <form
    onSubmit={props.handleSubmit(props.updateUser)}
    className="col-sm-10 col-xs-12"
  >
    <FormContainer
      submitting={props.submitting}
      labelClass="col-sm-3"
      controlClass="col-sm-7"
    >
      {props.protected ? (
        <StaticField
          label={translate('Full name')}
          value={props.user.full_name}
        />
      ) : (
        <StringField
          label={translate('Full name')}
          name="full_name"
          required={props.isRequired('full_name')}
        />
      )}
      {props.nativeNameIsVisible && !props.protected && (
        <StringField
          label={translate('Native name')}
          name="native_name"
          required={props.isRequired('native_name')}
        />
      )}
      {props.nativeNameIsVisible && props.protected && (
        <StaticField
          label={translate('Native name')}
          value={props.user.native_name}
        />
      )}
      <EmailField user={props.user} protected={props.protected} />
      {props.fieldIsVisible('registration_method') && (
        <StaticField
          label={translate('Registration method')}
          value={formatRegistrationMethod(props.user)}
        />
      )}
      {props.isVisibleForSupportOrStaff && (
        <StaticField
          label={translate('User status')}
          value={formatUserStatus(props.user)}
        />
      )}
      {props.user.civil_number && (
        <StaticField
          label={translate('ID code')}
          value={props.user.civil_number}
        />
      )}
      {props.fieldIsVisible('organization') && !props.protected && (
        <StringField
          label={translate('Organization name')}
          name="organization"
          required={props.isRequired('organization')}
        />
      )}
      {props.fieldIsVisible('organization') && props.protected && (
        <StaticField
          label={translate('Organization name')}
          value={props.user.organization}
        />
      )}
      {props.fieldIsVisible('job_title') && !props.protected && (
        <StringField
          label={translate('Job position')}
          name="job_title"
          required={props.isRequired('job_title')}
        />
      )}
      {props.fieldIsVisible('job_title') && props.protected && (
        <StaticField
          label={translate('Job position')}
          value={props.user.job_title}
        />
      )}
      {Array.isArray(props.user.affiliations) &&
      props.user.affiliations.length > 0 ? (
        <StaticField
          label={props.translate('Affiliations')}
          value={props.user.affiliations.join(', ')}
        />
      ) : null}
      {props.isVisibleForSupportOrStaff && (
        <StringField
          label={translate('Description')}
          name="description"
          required={props.isRequired('description')}
        />
      )}
      {props.fieldIsVisible('phone_number') && !props.protected && (
        <StringField
          label={translate('Phone number')}
          name="phone_number"
          required={props.isRequired('phone_number')}
        />
      )}
      {props.fieldIsVisible('phone_number') && props.protected && (
        <StaticField
          label={translate('Phone number')}
          value={props.user.phone_number}
        />
      )}
      <hr />
      <TermsOfService
        initial={props.initial}
        agreementDate={props.user.agreement_date}
      />
    </FormContainer>
    <Form.Group>
      <div className="col-sm-offset-3 col-sm-9">
        <FieldError error={props.error} />
        {!props.initial ? (
          <SubmitButton
            className="btn btn-primary me-2 mb-2 mt-2"
            submitting={props.submitting}
            label={props.translate('Update profile')}
          />
        ) : (
          <SubmitButton
            submitting={props.submitting}
            label={props.translate('Agree and proceed')}
          />
        )}
        {!props.initial && props.showDeleteButton && (
          <button
            id="remove-btn"
            type="button"
            className="btn btn-danger"
            onClick={props.showUserRemoval}
          >
            {props.translate('Remove profile')}
          </button>
        )}
      </div>
    </Form.Group>
  </form>
);

const enhance = reduxForm({
  form: 'userEdit',
});

export const UserEditForm = enhance(PureUserEditForm);
