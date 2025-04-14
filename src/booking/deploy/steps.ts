import { translate } from '@waldur/i18n';
import {
  DetailsOverviewStep,
  PlanStep,
} from '@waldur/marketplace/deploy/steps/constants';
import { FormFinalConfigurationStep } from '@waldur/marketplace/deploy/steps/FormFinalConfigurationStep';
import { OfferingConfigurationFormStep } from '@waldur/marketplace/deploy/types';

import { FormPeriodsStep } from './FormPeriodsStep';

export const deployOfferingSteps: OfferingConfigurationFormStep[] = [
  DetailsOverviewStep,
  PlanStep,
  {
    label: translate('Periods'),
    id: 'step-periods',
    fields: ['attributes.schedules'],
    required: true,
    requiredFields: ['attributes.schedules'],
    component: FormPeriodsStep,
  },
  {
    label: translate('Final configuration'),
    id: 'step-final-configuration',
    fields: ['attributes.name', 'attributes.description'],
    required: true,
    requiredFields: ['attributes.name'],
    component: FormFinalConfigurationStep,
  },
];
