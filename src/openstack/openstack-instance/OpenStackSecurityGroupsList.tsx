import { FunctionComponent } from 'react';
import { Card } from 'react-bootstrap';

import { translate } from '@waldur/i18n';
import { RefreshButton } from '@waldur/marketplace/offerings/update/components/RefreshButton';

import { OpenStackSecurityGroupsTable } from '../openstack-security-groups/OpenStackSecurityGroupsDialog';
import { SecurityGroup } from '../openstack-security-groups/types';

import { UpdateSecurityGroupsButton } from './actions/update-security-groups/UpdateSecurityGroupsButton';
import { ManageSecurityGroupsButton } from './ManageSecurityGroupsButton';

interface OwnProps {
  resource: {
    security_groups: SecurityGroup[];
  };
  marketplaceResource;
  refetch?(): void;
  isLoading?: boolean;
}

export const OpenStackSecurityGroupsList: FunctionComponent<OwnProps> = (
  props,
) => {
  return (
    <Card>
      <Card.Header>
        <Card.Title>
          {translate('Security groups details')}
          <RefreshButton refetch={props.refetch} loading={props.isLoading} />
        </Card.Title>
        <div className="card-toolbar">
          <UpdateSecurityGroupsButton
            resource={props.resource}
            refetch={props.refetch}
          />
          <ManageSecurityGroupsButton resource={props.marketplaceResource} />
        </div>
      </Card.Header>
      <Card.Body>
        {props.resource.security_groups.length === 0 &&
          translate('Instance does not have any security groups yet.')}
        {props.resource.security_groups.length > 0 && (
          <OpenStackSecurityGroupsTable
            securityGroups={props.resource.security_groups}
          />
        )}
      </Card.Body>
    </Card>
  );
};
