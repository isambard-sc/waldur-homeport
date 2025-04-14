import { translate } from '@waldur/i18n';

import { FormDetailsOverviewStep } from './FormDetailsOverviewStep';
import { FormPlanStep } from './FormPlanStep';

export const DetailsOverviewStep = {
  label: translate('Details overview'),
  id: 'step-general',
  fields: ['customer', 'project'],
  required: true,
  requiredFields: ['customer', 'project'],
  component: FormDetailsOverviewStep,
};

export const PlanStep = {
  label: translate('Plan'),
  id: 'step-plan',
  // plan_entries is not a field, it's is for identifying server-side errors related to plan entries.
  fields: ['plan', 'plan_entries'],
  required: true,
  requiredFields: ['plan'],
  component: FormPlanStep,
};
