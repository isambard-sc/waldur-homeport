import { lazyComponent } from '@waldur/core/lazyComponent';
import { StateDeclaration } from '@waldur/core/types';

export const states: StateDeclaration[] = [
  {
    name: 'marketplace-checklist-user',
    url: 'marketplace-checklist-user/:category/',
    component: lazyComponent(() =>
      import('./UserChecklist').then((module) => ({
        default: module.UserChecklist,
      })),
    ),
    parent: 'profile',
  },

  {
    name: 'marketplace-checklist-overview',
    url: 'marketplace-checklist-overview/:category/',
    component: lazyComponent(() =>
      import('./ChecklistOverview').then((module) => ({
        default: module.ChecklistOverview,
      })),
    ),
    parent: 'support',
  },

  {
    name: 'marketplace-checklist-customer',
    url: 'marketplace-checklist-customer/',
    component: lazyComponent(() =>
      import('./ChecklistCustomer').then((module) => ({
        default: module.ChecklistCustomer,
      })),
    ),
    parent: 'organization',
  },
];
