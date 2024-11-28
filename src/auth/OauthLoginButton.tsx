import { OIDCConfig } from '@waldur/administration/types';
import { IdentityProviderLogo } from '@waldur/auth/providers/IdentityProviderLogo';

import { LoginButton } from './LoginButton';
import { getOauthURL } from './utils';

export const OauthLoginButton = ({
  provider,
}: {
  provider: Pick<OIDCConfig, 'label' | 'provider'>;
}) => (
  <LoginButton
    image={<IdentityProviderLogo name={provider.provider} />}
    label={provider.label}
    onClick={() => {
      window.location.href = getOauthURL(provider);
    }}
  />
);
