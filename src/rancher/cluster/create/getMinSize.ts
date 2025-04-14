import { ENV } from '@waldur/core/config';

export const getMinSize = (mountPoint) =>
  ENV.plugins.WALDUR_RANCHER.MOUNT_POINT_MIN_SIZE[mountPoint];
