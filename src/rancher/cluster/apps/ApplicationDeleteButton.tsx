import { FunctionComponent } from 'react';
import { rancherAppsDestroy } from 'waldur-js-client';

import { translate } from '@waldur/i18n';
import { ResourceDeleteButton } from '@waldur/resource/actions/ResourceDeleteButton';

export const ApplicationDeleteButton: FunctionComponent<any> = (props) => (
  <ResourceDeleteButton
    apiFunction={() =>
      rancherAppsDestroy({ path: { uuid: props.application.uuid } })
    }
    resourceType={translate('application')}
  />
);
