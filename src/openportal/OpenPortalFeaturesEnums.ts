import { ENV } from '@waldur/core/config';

export enum OpenPortalFeatures {
  show_remote_projects = 'openportal.show_remote_projects',
}

/**
 * Feature visibility check that defaults to TRUE when the openportal
 * section is absent from ENV.FEATURES. This means the feature is visible
 * unless explicitly disabled (set to false), unlike the standard
 * isFeatureVisible which hides features that aren't listed.
 *
 * Set openportal.show_remote_projects = false in waldur-mastermind's
 * WALDUR_CORE.FEATURES to hide the tab on a deployment that doesn't use it.
 */
export const isOpenPortalFeatureVisible = (feature: OpenPortalFeatures): boolean => {
  if (!ENV.FEATURES) return true;
  const [section, key] = feature.split('.');
  const sectionFeatures = ENV.FEATURES[section];
  if (sectionFeatures === undefined) return true;
  return sectionFeatures[key] !== false;
};
