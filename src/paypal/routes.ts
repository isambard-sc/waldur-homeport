import { lazyComponent } from '@waldur/core/lazyComponent';
import { StateDeclaration } from '@waldur/core/types';

export const states: StateDeclaration[] = [
  {
    name: 'payment',
    url: '/payment/',
    abstract: true,
    component: lazyComponent(() =>
      import('@waldur/navigation/Layout').then((module) => ({
        default: module.Layout,
      })),
    ),
    data: {
      auth: true,
    },
  },

  {
    name: 'payment.approve',
    url: 'approve/',
    component: lazyComponent(() =>
      import('./PaymentApprove').then((module) => ({
        default: module.PaymentApprove,
      })),
    ),
  },

  {
    name: 'payment.cancel',
    url: 'cancel/',
    component: lazyComponent(() =>
      import('./PaymentCancel').then((module) => ({
        default: module.PaymentCancel,
      })),
    ),
  },
];
