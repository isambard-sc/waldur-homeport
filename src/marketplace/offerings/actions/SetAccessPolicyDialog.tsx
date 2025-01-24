import { FunctionComponent } from 'react';

import { OrganizationGroupCreateButton } from '@waldur/administration/organizations/OrganizationGroupCreateButton';
import { LoadingSpinner } from '@waldur/core/LoadingSpinner';
import { translate } from '@waldur/i18n';
import { SetAccessPolicyDialogForm } from '@waldur/marketplace/offerings/actions/SetAccessPolicyDialogForm';
import { Offering, OrganizationGroup, Plan } from '@waldur/marketplace/types';
import { NoResult } from '@waldur/navigation/header/search/NoResult';

interface SetAccessPolicyDialogProps {
  resolve: {
    organizationGroups: OrganizationGroup[];
    loading: any;
    error: any;
    offering?: Offering;
    plan?: Plan;
    refetch: any;
    refetchGroups: any;
    customer: any;
  };
}

export const SetAccessPolicyDialog: FunctionComponent<
  SetAccessPolicyDialogProps
> = ({ resolve }) => {
  return resolve.loading ? (
    <LoadingSpinner />
  ) : resolve.error ? (
    <>{translate('Unable to load organization groups.')}</>
  ) : resolve.organizationGroups.length > 0 ? (
    <SetAccessPolicyDialogForm
      organizationGroups={resolve.organizationGroups}
      offering={resolve.offering}
      plan={resolve.plan}
      customer={resolve.customer}
      refetch={resolve.refetch}
    />
  ) : (
    <NoResult
      title={translate('No organization groups found')}
      message={translate(
        'No organization groups are currently defined. Please create groups to configure access policies.',
      )}
      actions={
        <OrganizationGroupCreateButton refetch={resolve.refetchGroups} />
      }
    />
  );
};
