import { ENV } from '@waldur/core/config';

export const getNativeNameVisible = () =>
  ENV.plugins.WALDUR_CORE.NATIVE_NAME_ENABLED === true;

export const getShortNameVisible = () => true;
