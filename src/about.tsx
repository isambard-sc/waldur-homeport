import { StateDeclaration } from '@waldur/core/types';
import { translate } from '@waldur/i18n';

import { lazyComponent } from './core/lazyComponent';
import { loadContext } from './marketplace/resolve';

export const states: StateDeclaration[] = [
  {
    name: 'about',
    url: '',
    abstract: true,
    component: lazyComponent(() =>
      import('@waldur/navigation/Layout').then((module) => ({
        default: module.Layout,
      })),
    ),
    data: {
      title: () => translate('About'),
    },
    resolve: [
      {
        token: 'public-context',
        resolveFn: loadContext,
        deps: ['$transition$'],
      },
    ],
  },
  {
    name: 'about.tos',
    url: '/tos/',
    component: lazyComponent(() =>
      import('./TosPage').then((module) => ({
        default: module.TosPage,
      })),
    ),
    data: {
      breadcrumb: () => translate('Terms of Service'),
    },
  },

  {
    name: 'about.privacy',
    url: '/privacy/',
    component: lazyComponent(() =>
      import('./PrivacyPage').then((module) => ({
        default: module.PrivacyPage,
      })),
    ),
    data: {
      breadcrumb: () => translate('Privacy policy'),
    },
  },
];
