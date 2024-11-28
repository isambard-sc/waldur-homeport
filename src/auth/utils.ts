import { OIDCConfig } from '@waldur/administration/types';
import { ENV } from '@waldur/configs/default';

export const getOauthURL = (provider: Pick<OIDCConfig, 'provider'>) =>
  `${ENV.apiEndpoint}api-auth/${provider.provider}/init/`;
