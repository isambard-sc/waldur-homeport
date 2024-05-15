import { Globe } from '@phosphor-icons/react';
import Qs from 'qs';

import { ENV } from '@waldur/configs/default';

import { LoginButton } from './LoginButton';

export const Saml2DiscoveryButton = () => (
  <LoginButton
    icon={<Globe />}
    label={ENV.plugins.WALDUR_AUTH_SAML2.DISCOVERY_SERVICE_LABEL}
    onClick={() => {
      const discovery = ENV.plugins.WALDUR_AUTH_SAML2.DISCOVERY_SERVICE_URL;
      const params = {
        entityID: `${ENV.plugins.WALDUR_CORE.MASTERMIND_URL}/api-auth/saml2/metadata/`,
        return: `${document.baseURI}saml2_discovery_completed/`,
      };
      window.location.href = `${discovery}?${Qs.stringify(params)}`;
    }}
  />
);
