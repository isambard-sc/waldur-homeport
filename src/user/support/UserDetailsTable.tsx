import { FunctionComponent } from 'react';
import { Table } from 'react-bootstrap';
import { connect } from 'react-redux';

import { formatDateTime } from '@waldur/core/dateUtils';
import { Panel } from '@waldur/core/Panel';
import { isFeatureVisible } from '@waldur/features/connect';
import { UserFeatures } from '@waldur/FeaturesEnums';
import { translate } from '@waldur/i18n';
import { getNativeNameVisible } from '@waldur/store/config';
import { RootState } from '@waldur/store/reducers';
import {
  formatUserIsActive,
  formatUserStatus,
} from '@waldur/user/support/utils';
import { UserDetails } from '@waldur/workspace/types';

import { Row } from './Row';
import { userLanguageIsVisible, isVisibleForSupportOrStaff } from './selectors';

interface StateProps {
  userLanguageIsVisible: boolean;
  isVisibleForSupportOrStaff: boolean;
  nativeNameVisible: boolean;
}

interface OwnProps {
  user: UserDetails;
  profile?: any;
  hasHeader?: boolean;
}

type UserDetailsTableProps = StateProps & OwnProps;

const PureUserDetailsTable: FunctionComponent<UserDetailsTableProps> = (
  props,
) => (
  <Table responsive={true} bordered={true} className="text-gray-700 px-0">
    <tbody>
      <Row label={translate('Full name')} value={props.user.full_name} />
      {props.nativeNameVisible && (
        <Row label={translate('Native name')} value={props.user.native_name} />
      )}
      <Row label={translate('ID code')} value={props.user.civil_number} />
      <Row label={translate('Phone numbers')} value={props.user.phone_number} />
      <Row label={translate('Username')} value={props.user.username} />
      <Row label={translate('Email')} value={props.user.email} />
      {isFeatureVisible(UserFeatures.show_slug) && (
        <Row label={translate('Shortname')} value={props.user.slug} />
      )}
      <Row
        label={translate('Preferred language')}
        value={props.user.preferred_language}
        isVisible={props.userLanguageIsVisible}
      />
      <Row
        label={translate('Registration method')}
        value={props.user.identity_provider_label}
      />
      <Row
        label={translate('Date joined')}
        value={formatDateTime(props.user.date_joined)}
      />
      <Row label={translate('Organization')} value={props.user.organization} />
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
        isVisible={props.isVisibleForSupportOrStaff}
      />
      <Row
        label={translate('Account status')}
        value={formatUserIsActive(props.user)}
        isVisible={props.isVisibleForSupportOrStaff}
      />
      <Row
        label={translate('FreeIPA')}
        value={props.profile?.username}
        isVisible={props.profile?.is_active}
      />
    </tbody>
  </Table>
);

const UserDetailsTableContainer: FunctionComponent<UserDetailsTableProps> = (
  props,
) =>
  props.hasHeader ? (
    <Panel title={translate('Details')}>
      <PureUserDetailsTable {...props} />
    </Panel>
  ) : (
    <PureUserDetailsTable {...props} />
  );

const mapStateToProps = (state: RootState) => ({
  userLanguageIsVisible: userLanguageIsVisible(state),
  isVisibleForSupportOrStaff: isVisibleForSupportOrStaff(state),
  nativeNameVisible: getNativeNameVisible(state),
});

const enhance = connect<StateProps, {}, OwnProps>(mapStateToProps);

export const UserDetailsTable = enhance(UserDetailsTableContainer);
