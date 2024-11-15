import { useTitle } from 'react-use';

import { translate } from './i18n';
import {
  UserAgreementComponent,
  USER_AGREEMENT_TYPES,
} from './UserAgreementComponent';

export const TosPage = () => {
  useTitle(translate('User agreements'));
  return (
    <UserAgreementComponent
      agreement_type={USER_AGREEMENT_TYPES.terms_of_service}
      title={translate('Terms of Service')}
    />
  );
};
