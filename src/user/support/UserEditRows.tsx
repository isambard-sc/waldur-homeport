import { useSelector } from 'react-redux';

import { ENV } from '@waldur/configs/default';
import { formatDateTime } from '@waldur/core/dateUtils';
import { isFeatureVisible } from '@waldur/features/connect';
import { UserFeatures } from '@waldur/FeaturesEnums';
import { translate } from '@waldur/i18n';
import { getNativeNameVisible } from '@waldur/store/config';
import { getShortNameVisible } from '@waldur/store/config';
import { formatUserStatus } from '@waldur/user/support/utils';
import { getUser, isStaffOrSupport } from '@waldur/workspace/selectors';
import { UserDetails } from '@waldur/workspace/types';

import { ChangeEmailButton } from './ChangeEmailButton';
import { UserEditRow } from './UserEditRow';

const isRequired = (field: string) => {
  return ENV.plugins.WALDUR_CORE.USER_MANDATORY_FIELDS.includes(field);
};

const getDefaultRequiredMsg = (field, isSelf) =>
  isSelf
    ? translate('Your {field} is required', { field })
    : translate("The user's {field} is required", { field });

const fieldIsProtected = (user: UserDetails, field: string) =>
  user.identity_provider_fields.includes(field) ||
  (
    ENV.plugins.WALDUR_CORE.PROTECT_USER_DETAILS_FOR_REGISTRATION_METHODS || []
  ).includes(user.registration_method);

const FirstNameRow = ({ user, isSelf }) => (
  <UserEditRow
    user={user}
    label={translate('First name')}
    name="first_name"
    value={user.first_name}
    description={
      isSelf
        ? translate('Display your first name on your profile')
        : translate("Display the user's first name on their profile")
    }
    requiredMsg={
      isRequired('first_name')
        ? getDefaultRequiredMsg(translate('first name'), isSelf)
        : null
    }
    protected={fieldIsProtected(user, 'first_name')}
  />
);

const LastNameRow = ({ user, isSelf }) => (
  <UserEditRow
    user={user}
    label={translate('Last name')}
    name="last_name"
    value={user.last_name}
    description={
      isSelf
        ? translate('Display your last name on your profile')
        : translate("Display the user's last name on their profile")
    }
    requiredMsg={
      isRequired('last_name')
        ? getDefaultRequiredMsg(translate('last name'), isSelf)
        : null
    }
    protected={fieldIsProtected(user, 'last_name')}
  />
);

const NativeNameRow = ({ user, isSelf }) => {
  const nativeNameIsVisible = useSelector(getNativeNameVisible);
  return nativeNameIsVisible ? (
    <UserEditRow
      user={user}
      label={translate('Native name')}
      name="native_name"
      value={user.native_name}
      requiredMsg={
        isRequired('native_name')
          ? getDefaultRequiredMsg(translate('native name'), isSelf)
          : null
      }
      protected={fieldIsProtected(user, 'native_name')}
    />
  ) : null;
};

const PhoneNumberRow = ({ user, isSelf }) => (
  <UserEditRow
    user={user}
    label={translate('Phone number')}
    name="phone_number"
    value={user.phone_number}
    protected={fieldIsProtected(user, 'phone_number')}
    requiredMsg={
      isRequired('phone_number')
        ? translate('{pronoun} phone number', {
          pronoun: isSelf ? translate('Your') : translate("User's"),
        })
        : null
    }
    description={
      isSelf
        ? translate('Enter your contact number')
        : translate('Enter a contact number for the user')
    }
  />
);

const EmailRow = ({ user, isSelf }) => (
  <UserEditRow
    user={user}
    label={translate('Email')}
    name="email"
    value={user.email}
    protected={fieldIsProtected(user, 'email')}
    requiredMsg={
      isRequired('email')
        ? translate(
          '{pronoun} email is required for account notifications and password recovery',
          { pronoun: isSelf ? translate('Your') : translate("User's") },
        )
        : null
    }
    description={
      isSelf
        ? translate('Provide an email address for communication and recovery')
        : translate(
          "Provide an email address for the user's communication and recovery",
        )
    }
    actions={
      !fieldIsProtected(user, 'email') ? (
        <ChangeEmailButton user={user} />
      ) : null
    }
  />
);

const DateJoinedRow = ({ user }) => (
  <UserEditRow
    user={user}
    label={translate('Date joined')}
    name="date_joined"
    value={formatDateTime(user.date_joined)}
    protected={true}
    protectedMsg={translate('Read-only field')}
    description={translate('The date the user has joined')}
  />
);

const UserTypeRow = ({ user, isSelf }) => {
  const visible = useSelector(isStaffOrSupport);
  return visible ? (
    <UserEditRow
      user={user}
      label={translate('User type')}
      name="type"
      value={formatUserStatus(user)}
      protected={true}
      description={
        isSelf
          ? translate('Describe your user account type')
          : translate("Describe user's account type")
      }
    />
  ) : null;
};

const CivilNumberRow = ({ user }) =>
  user.civil_number ? (
    <UserEditRow
      user={user}
      label={translate('ID code')}
      name="civil_number"
      value={user.civil_number}
      protected={true}
    />
  ) : null;

const OrganizationRow = ({ user, isSelf }) => (
  <UserEditRow
    user={user}
    label={translate('Organization name')}
    name="organization"
    value={user.organization}
    protected={fieldIsProtected(user, 'organization')}
    description={
      isSelf
        ? translate(
          'Specify the name of the organization you are affiliated with',
        )
        : translate(
          'Specify the name of the organization the user is affiliated with',
        )
    }
  />
);

const JobTitleRow = ({ user, isSelf }) => (
  <UserEditRow
    user={user}
    label={translate('Job position')}
    name="job_title"
    value={user.job_title}
    protected={fieldIsProtected(user, 'job_title')}
    description={
      isSelf
        ? translate('Describe your role or position within the organization')
        : translate(
          "Describe the user's role or position within the organization",
        )
    }
  />
);

const AffiliationsRow = ({ user }) =>
  Array.isArray(user.affiliations) && user.affiliations.length > 0 ? (
    <UserEditRow
      user={user}
      label={translate('Affiliations')}
      name="affiliations"
      value={user.affiliations.join(', ')}
      protected={true}
    />
  ) : null;

const DescriptionRow = ({ user, isSelf }) => {
  const visible = useSelector(isStaffOrSupport);
  return visible ? (
    <UserEditRow
      user={user}
      label={translate('Description')}
      name="description"
      value={user.description}
      description={translate(
        'Additional account description invisible to user',
      )}
      requiredMsg={
        isRequired('description')
          ? getDefaultRequiredMsg(translate('description'), isSelf)
          : null
      }
    />
  ) : null;
};

const ShortNameRow = ({ user, isSelf }) => {
  return useSelector(getShortNameVisible) ? (
    <UserEditRow
      user={user}
      label={translate('UNIX User name')}
      name="unix_username"
      value={user.unix_username}
      protected={!user.is_staff}
      requiredMsg={
        isRequired('short_name')
          ? translate('{pronoun} short name', {
            pronoun: isSelf ? translate('Your') : translate("User's"),
          })
          : null
      }
      description={
        isSelf
          ? translate('A short, unique name for you. It will be used to form ' +
            'your local username on the systems. Should only ' +
            'contain lower-case letters and digits and must start with ' +
            'a letter. Must be between 5 - 20 characters long.')
          : translate('Enter a short name for the user (used for Unix accounts)')
      }
    />
  ) : null;
};

export const UserEditRows = ({ user }: { user: UserDetails }) => {
  const currentUser = useSelector(getUser);
  const isSelf = currentUser.uuid === user.uuid;

  return (
    <>
      <FirstNameRow user={user} isSelf={isSelf} />
      <LastNameRow user={user} isSelf={isSelf} />
      <ShortNameRow user={user} isSelf={isSelf} />
      <NativeNameRow user={user} isSelf={isSelf} />
      <PhoneNumberRow user={user} isSelf={isSelf} />
      <EmailRow user={user} isSelf={isSelf} />
      <DateJoinedRow user={user} />
      <UserTypeRow user={user} isSelf={isSelf} />
      <CivilNumberRow user={user} />
      <OrganizationRow user={user} isSelf={isSelf} />
      <JobTitleRow user={user} isSelf={isSelf} />
      <AffiliationsRow user={user} />
      <DescriptionRow user={user} isSelf={isSelf} />
    </>
  );
};
