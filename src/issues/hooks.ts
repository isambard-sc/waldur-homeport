import { ENV } from '@waldur/core/config';

export const hasSupport = () => !!ENV.plugins.WALDUR_SUPPORT?.ENABLED;
