import {
  pushStateLocationPlugin,
  servicesPlugin,
  UIRouterReact,
} from '@uirouter/react';

import { states } from './states';

// Create a new instance of the Router
export const router = new UIRouterReact();

router.plugin(servicesPlugin);
router.plugin(pushStateLocationPlugin);
states.forEach((state) => router.stateRegistry.register(state));

// Global config for router
router.urlService.rules.initial({ state: 'profile.details' });
