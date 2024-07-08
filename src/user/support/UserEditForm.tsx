import { FunctionComponent } from 'react';
import { Button, Form } from 'react-bootstrap';
import { InjectedFormProps, reduxForm } from 'redux-form';

import {
  FieldError,
  FormContainer,
  StringField,
  SubmitButton,
} from '@waldur/form';
import { ImageField } from '@waldur/form/ImageField';
import { translate } from '@waldur/i18n';
import { StaticField } from '@waldur/user/support/StaticField';
import { formatUserStatus } from '@waldur/user/support/utils';
import { UserDetails } from '@waldur/workspace/types';

import { EmailField } from './EmailField';
import { TermsOfService } from './TermsOfService';

interface UserEditFormData {
  first_name: string;
  last_name: string;
  email: string;
  user_status?: string;
  id_code?: string;
  organization: string;
  job_position: string;
  description: string;
  phone_number: string;
  unix_username: string;
}
interface OwnProps {
  updateUser(data: UserEditFormData): Promise<void>;
  initial?: boolean;
  isVisibleForSupportOrStaff: boolean;
  fieldIsVisible: (field: string) => boolean;
  isRequired: (field: string) => boolean;
  nativeNameIsVisible: boolean;
  user: UserDetails;
  fieldIsProtected(field: string): boolean;
}

function validateUnixUsername(value) {
  if (!value) {
    return undefined;
  } else if (value.length > 20) {
    return 'Must be 20 characters or less';
  } else if (value.length < 5) {
    return 'Must be 5 characters or more';
  } else if (!value.match(/^[a-z][a-z0-9]+$/)) {
    return 'Must only contain numbers and lowercase-letters and start with a letter.';
  } else {
    return undefined;
  }
}

export const PureUserEditForm: FunctionComponent<
  OwnProps & InjectedFormProps<{}, OwnProps>
> = (props) => (
  <form onSubmit={props.handleSubmit(props.updateUser)}>
    <FormContainer submitting={props.submitting} floating={true}>
      <EmailField
        user={props.user}
        protected={props.fieldIsProtected('email')}
      />
      {!props.fieldIsProtected('first_name') && (
        <StringField
          name="first_name"
          label={translate('First name')}
          required={props.isRequired('first_name')}
        />
      )}
      {!props.fieldIsProtected('last_name') && (
        <StringField
          name="last_name"
          label={translate('Last name')}
          required={props.isRequired('last_name')}
        />
      )}
      {props.nativeNameIsVisible && !props.fieldIsProtected('native_name') && (
        <StringField
          label={translate('Native name')}
          name="native_name"
          required={props.isRequired('native_name')}
        />
      )}
      {props.nativeNameIsVisible && props.fieldIsProtected('native_name') && (
        <StaticField
          label={translate('Native name')}
          value={props.user.native_name}
          protected
          disabled
        />
      )}
      {!props.user.unix_username && (
        <StringField
          label={translate('UNIX user name')}
          name="unix_username"
          required={props.isRequired('unix_username')}
          description={translate(
            'A short, unique name for you. It will be used to form your local username on any systems. Should only contain lower-case letters and digits and must start with a letter. Must be between 5-20 characters long.',
          )}
          validate={[validateUnixUsername]}
        />
      )}
      {props.user.unix_username && (
        <StaticField
          label={translate('UNIX user name')}
          value={props.user.unix_username}
          disabled
        />
      )}
      {props.isVisibleForSupportOrStaff && (
        <StaticField
          label={translate('User status')}
          value={formatUserStatus(props.user)}
          disabled
        />
      )}
      {props.user.civil_number && (
        <StaticField
          label={translate('ID code')}
          value={props.user.civil_number}
          disabled
        />
      )}
      {props.fieldIsVisible('organization') &&
        !props.fieldIsProtected('organization') && (
          <StringField
            label={translate('Organization name')}
            name="organization"
            required={props.isRequired('organization')}
          />
        )}
      {props.fieldIsVisible('organization') &&
        props.fieldIsProtected('organization') && (
          <StaticField
            label={translate('Organization name')}
            value={props.user.organization}
            disabled
            protected
          />
        )}
      {props.fieldIsVisible('job_title') &&
        !props.fieldIsProtected('job_title') && (
          <StringField
            label={translate('Job position')}
            name="job_title"
            required={props.isRequired('job_title')}
          />
        )}
      {props.fieldIsVisible('job_title') &&
        props.fieldIsProtected('job_title') && (
          <StaticField
            label={translate('Job position')}
            value={props.user.job_title}
            disabled
            protected
          />
        )}
      {Array.isArray(props.user.affiliations) &&
      props.user.affiliations.length > 0 ? (
        <StaticField
          label={translate('Affiliations')}
          value={props.user.affiliations.join(', ')}
          disabled
          protected
        />
      ) : null}
      {props.isVisibleForSupportOrStaff && (
        <StringField
          label={translate('Description')}
          name="description"
          required={props.isRequired('description')}
        />
      )}
      {props.fieldIsVisible('phone_number') &&
        !props.fieldIsProtected('phone_number') && (
          <StringField
            label={translate('Phone number')}
            name="phone_number"
            required={props.isRequired('phone_number')}
          />
        )}
      {props.fieldIsVisible('phone_number') &&
        props.fieldIsProtected('phone_number') && (
          <StaticField
            label={translate('Phone number')}
            value={props.user.phone_number}
            disabled
            protected
          />
        )}
      <hr />
      <ImageField name="image" initialValue={props.user.image} />
      <TermsOfService
        initial={props.initial}
        agreementDate={props.user.agreement_date}
      />
    </FormContainer>
    <Form.Group>
      <div className="pull-right">
        <FieldError error={props.error} />
        {props.dirty && (
          <Button
            variant="secondary"
            size="sm"
            className="me-2"
            onClick={props.reset}
          >
            {translate('Discard')}
          </Button>
        )}
        {!props.initial ? (
          props.dirty ? (
            <SubmitButton
              className="btn btn-primary btn-sm me-2"
              submitting={props.submitting}
              label={translate('Save changes')}
            />
          ) : null
        ) : (
          <SubmitButton
            submitting={props.submitting}
            label={translate('Agree and proceed')}
          />
        )}
      </div>
    </Form.Group>
  </form>
);

const enhance = reduxForm<{}, OwnProps>({
  form: 'userEdit',
});

export const UserEditForm = enhance(PureUserEditForm);
