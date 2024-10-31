import { lazyComponent } from '@waldur/core/lazyComponent';
import { translate } from '@waldur/i18n';
import { OfferingConfiguration } from '@waldur/marketplace/common/types';
import { COMMON_OPTIONS } from '@waldur/support/marketplace';

import { REMOTE_OFFERING_TYPE } from './constants';

const RemoteOfferingSecretOptions = lazyComponent(
  () => import('./RemoteOfferingSecretOptions'),
  'RemoteOfferingSecretOptions',
);

export const RemoteOffering: OfferingConfiguration = {
  type: REMOTE_OFFERING_TYPE,
  get label() {
    return translate('Remote offering');
  },
  ...COMMON_OPTIONS,
  showBackendId: true,
  provisioningConfigForm: RemoteOfferingSecretOptions,
};
