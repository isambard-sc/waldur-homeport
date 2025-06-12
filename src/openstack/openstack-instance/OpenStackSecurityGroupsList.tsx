import { FunctionComponent } from 'react';
import { Card } from 'react-bootstrap';
import { OpenStackInstance } from 'waldur-js-client';

import { translate } from '@waldur/i18n';
import { RefreshButton } from '@waldur/marketplace/offerings/update/components/RefreshButton';

import { OpenStackSecurityGroupsTable } from '../openstack-security-groups/OpenStackSecurityGroupsDialog';

import { UpdateSecurityGroupsButton } from './actions/update-security-groups/UpdateSecurityGroupsButton';
import { ManageSecurityGroupsButton } from './ManageSecurityGroupsButton';

interface OwnProps {
  resourceScope: OpenStackInstance;
  resource;
  refetch?(): void;
  isLoading?: boolean;
}

export const OpenStackSecurityGroupsList: FunctionComponent<OwnProps> = (
  props,
) => {
  return (
    <Card className="card card-table card-bordered">
      <Card.Header>
        <Card.Title>
          <span className="me-2">{translate('Security groups details')}</span>
          <RefreshButton refetch={props.refetch} loading={props.isLoading} />
        </Card.Title>
        <div className="card-toolbar">
          <UpdateSecurityGroupsButton
            resource={props.resourceScope}
            refetch={props.refetch}
          />

          <ManageSecurityGroupsButton resource={props.resource} />
        </div>
      </Card.Header>
      <Card.Body>
        {props.resourceScope.security_groups.length === 0 &&
          translate('Instance does not have any security groups yet.')}
        {props.resourceScope.security_groups.length > 0 && (
          <OpenStackSecurityGroupsTable
            securityGroups={props.resourceScope.security_groups}
          />
        )}
      </Card.Body>
    </Card>
  );
};
