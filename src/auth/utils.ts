import Qs from 'qs';

const getStateId = () =>
  encodeURIComponent(Math.random().toString(36).substr(2));

export const getRedirectUri = (provider) =>
  `${document.baseURI}oauth_login_completed/${provider}/`;

export const getOauthCallback = (options) => () => {
  const params = {
    response_type: 'code',
    client_id: options.clientId,
    redirect_uri: getRedirectUri(options.name),
    scope: options.scope,
    state: getStateId(),
  };
  window.location.href = `${options.authUrl}?${Qs.stringify(params)}`;
};
