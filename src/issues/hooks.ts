import { ENV } from '@waldur/configs/default';

export const hasSupport = () => !!ENV.plugins.WALDUR_SUPPORT?.ENABLED;
