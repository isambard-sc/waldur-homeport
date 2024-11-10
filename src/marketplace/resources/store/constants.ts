import { createFormAction } from '@waldur/redux-form-saga';

export const submitUsage: any = createFormAction(
  'waldur/marketplace/resources/SUBMIT_USAGE',
);
export const changeLimits: any = createFormAction(
  'waldur/marketplace/resources/CHANGE_LIMITS',
);

export const PERIOD_CHANGED = 'waldur/marketplace/resources/PERIOD_CHANGED';
export const FORM_ID = 'ResourceUsageCreate';
