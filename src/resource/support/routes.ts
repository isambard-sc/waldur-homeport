import { lazyComponent } from '@waldur/core/lazyComponent';
import { StateDeclaration } from '@waldur/core/types';
import { SupportFeatures } from '@waldur/FeaturesEnums';
import { translate } from '@waldur/i18n';

export const states: StateDeclaration[] = [
  {
    name: 'support.shared-providers',
    url: 'shared-providers/',
    component: lazyComponent(() =>
      import('./SharedProviderContainer').then((module) => ({
        default: module.SharedProviderContainer,
      })),
    ),
    data: {
      feature: SupportFeatures.shared_providers,
      breadcrumb: () => translate('Shared providers'),
      priority: 104,
    },
  },
];
