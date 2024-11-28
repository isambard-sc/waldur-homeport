import { useTitle } from '@waldur/navigation/title';

import { translate } from '../i18n';

import { USER_AGREEMENT_TYPES } from './const';
import { UserAgreementComponent } from './UserAgreementComponent';

export const TosPage = () => {
  useTitle(translate('User agreements'));
  return (
    <UserAgreementComponent
      agreement_type={USER_AGREEMENT_TYPES.terms_of_service}
      title={translate('Terms of Service')}
    />
  );
};
