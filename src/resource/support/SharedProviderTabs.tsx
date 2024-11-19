import React from 'react';
import { Card, Tab, Tabs } from 'react-bootstrap';
import { useSelector } from 'react-redux';

import { translate } from '@waldur/i18n';

import { SharedProviderCustomers } from './SharedProviderCustomers';
import { providerSelector } from './SharedProviderFilter';
import { SharedProviderResources } from './SharedProviderResources';

export const SharedProviderTabs: React.FC = () => {
  const provider = useSelector(providerSelector);

  return provider ? (
    <Card.Body>
      <Tabs defaultActiveKey={1} id="shared-provider-tabs" unmountOnExit={true}>
        <Tab eventKey={1} title={translate('Organizations')}>
          <Card>
            <SharedProviderCustomers provider_uuid={provider.uuid} />
          </Card>
        </Tab>
        <Tab eventKey={2} title={translate('VMs')}>
          <Card>
            <SharedProviderResources provider_uuid={provider.uuid} />
          </Card>
        </Tab>
      </Tabs>
    </Card.Body>
  ) : null;
};
