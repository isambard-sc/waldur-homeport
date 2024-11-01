import { createFormAction } from '@waldur/redux-form-saga';

export const submitUsage = createFormAction(
  'waldur/marketplace/resources/SUBMIT_USAGE',
);
export const switchPlan = createFormAction(
  'waldur/marketplace/resources/SWITCH_PLAN',
);
export const changeLimits = createFormAction(
  'waldur/marketplace/resources/CHANGE_LIMITS',
);

export const PERIOD_CHANGED = 'waldur/marketplace/resources/PERIOD_CHANGED';
export const FORM_ID = 'ResourceUsageCreate';
