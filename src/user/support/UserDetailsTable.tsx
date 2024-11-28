import { FunctionComponent } from 'react';
import { Table } from 'react-bootstrap';
import { useSelector } from 'react-redux';

import { formatDateTime } from '@waldur/core/dateUtils';
import { isFeatureVisible } from '@waldur/features/connect';
import { UserFeatures } from '@waldur/FeaturesEnums';
import { translate } from '@waldur/i18n';
import { getNativeNameVisible } from '@waldur/store/config';
import { type RootState } from '@waldur/store/reducers';
import {
  formatUserIsActive,
  formatUserStatus,
} from '@waldur/user/support/utils';
import { isStaffOrSupport } from '@waldur/workspace/selectors';
import { UserDetails } from '@waldur/workspace/types';

import { Row } from './Row';

interface OwnProps {
  user: UserDetails;
  profile?: any;
  hasHeader?: boolean;
}

export const UserDetailsTable: FunctionComponent<OwnProps> = (props) => {
  const isVisible = useSelector((state: RootState) => isStaffOrSupport(state));

  return (
    <Table responsive={true} bordered={true} className="text-gray-700 px-0">
      <tbody>
        <Row label={translate('Full name')} value={props.user.full_name} />
        {getNativeNameVisible() && (
          <Row
            label={translate('Native name')}
            value={props.user.native_name}
          />
        )}
        <Row label={translate('ID code')} value={props.user.civil_number} />
        <Row
          label={translate('Phone numbers')}
          value={props.user.phone_number}
        />
        <Row label={translate('Username')} value={props.user.username} />
        <Row label={translate('Email')} value={props.user.email} />
        {isFeatureVisible(UserFeatures.show_slug) && (
          <Row label={translate('Shortname')} value={props.user.slug} />
        )}
        <Row
          label={translate('Preferred language')}
          value={props.user.preferred_language}
          isVisible={isFeatureVisible(UserFeatures.preferred_language)}
        />
        <Row
          label={translate('Registration method')}
          value={props.user.identity_provider_label}
        />
        <Row
          label={translate('Date joined')}
          value={formatDateTime(props.user.date_joined)}
        />
        <Row
          label={translate('Organization')}
          value={props.user.organization}
        />
        <Row label={translate('Job position')} value={props.user.job_title} />
        {Array.isArray(props.user.affiliations) &&
        props.user.affiliations.length > 0 ? (
          <Row
            label={translate('Affiliations')}
            value={props.user.affiliations.join(', ')}
          />
        ) : null}
        <Row
          label={translate('User type')}
          value={formatUserStatus(props.user)}
          isVisible={isVisible}
        />
        <Row
          label={translate('Account status')}
          value={formatUserIsActive(props.user)}
          isVisible={isVisible}
        />
        <Row
          label={translate('FreeIPA')}
          value={props.profile?.username}
          isVisible={props.profile?.is_active}
        />
      </tbody>
    </Table>
  );
};
