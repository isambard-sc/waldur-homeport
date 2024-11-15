import { useTitle } from 'react-use';

import { translate } from './i18n';
import {
  UserAgreementComponent,
  USER_AGREEMENT_TYPES,
} from './UserAgreementComponent';

export const PrivacyPage = () => {
  useTitle(translate('User agreements'));
  return (
    <UserAgreementComponent
      agreement_type={USER_AGREEMENT_TYPES.privacy_policy}
      title={translate('Privacy Policy')}
    />
  );
};
