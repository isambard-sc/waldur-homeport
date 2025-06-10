import { BaseDeployPage } from '@waldur/marketplace/deploy/DeployPage';

import { deployOfferingSteps } from './steps';

export const OpenPortalRemoteOrderForm = (props) => (
  <BaseDeployPage inputFormSteps={deployOfferingSteps} {...props} />
);
