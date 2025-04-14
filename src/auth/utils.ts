import { IdentityProvider } from 'waldur-js-client';

import { ENV } from '@waldur/core/config';

export const getOauthURL = (provider: Pick<IdentityProvider, 'provider'>) =>
  `${ENV.apiEndpoint}api-auth/${provider.provider}/init/`;
