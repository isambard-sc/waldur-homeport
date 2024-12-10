import { BaseDeployPage } from '@waldur/marketplace/deploy/DeployPage';

import { deployOfferingSteps } from './steps';

export const OpenPortalOrderForm = (props) => (
  <BaseDeployPage inputFormSteps={deployOfferingSteps} {...props} />
);
