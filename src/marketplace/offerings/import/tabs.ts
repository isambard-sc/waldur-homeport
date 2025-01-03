import { ProgressStep } from '@waldur/core/ProgressSteps';
import { translate } from '@waldur/i18n';

import { CredentialsTab } from './CredentialsTab';
import { ImportReviewTab } from './ImportReviewTab';
import { SelectCategoryTab } from './SelectCategoryTab';
import { SelectOfferingTab } from './SelectOfferingTab';
import { SelectOrganizationTab } from './SelectOrganizationTab';

export const OFFERING_IMPORT_STEPS: ProgressStep[] = [
  {
    key: 'Credentials',
    label: translate('Connect to remote waldur'),
    completed: false,
    variant: 'primary',
  },
  {
    key: 'Organization',
    label: translate('Select organization'),
    completed: false,
    variant: 'primary',
  },
  {
    key: 'Offering',
    label: translate('Choose offerings'),
    completed: false,
    variant: 'primary',
  },
  {
    key: 'Category',
    label: translate('Map categories'),
    completed: false,
    variant: 'primary',
  },
  {
    key: 'Review',
    label: translate('Review and confirm'),
    completed: false,
    variant: 'primary',
  },
];

export const OFFERING_IMPORT_TABS = {
  Credentials: CredentialsTab,
  Organization: SelectOrganizationTab,
  Offering: SelectOfferingTab,
  Category: SelectCategoryTab,
  Review: ImportReviewTab,
};
