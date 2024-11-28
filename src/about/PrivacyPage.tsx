import { useTitle } from '@waldur/navigation/title';

import { translate } from '../i18n';

import { USER_AGREEMENT_TYPES } from './const';
import { UserAgreementComponent } from './UserAgreementComponent';

export const PrivacyPage = () => {
  useTitle(translate('User agreements'));
  return (
    <UserAgreementComponent
      agreement_type={USER_AGREEMENT_TYPES.privacy_policy}
      title={translate('Privacy Policy')}
    />
  );
};
