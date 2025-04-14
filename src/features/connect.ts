import { ENV } from '@waldur/core/config';
import { FeaturesEnum } from '@waldur/FeaturesEnums';

export const isFeatureVisible = (feature: FeaturesEnum) => {
  if (feature === undefined || feature === null) {
    return true;
  }
  if (!ENV.FEATURES) {
    return false;
  }
  const [section, key] = feature.split('.');
  return (ENV.FEATURES[section] || {})[key];
};
