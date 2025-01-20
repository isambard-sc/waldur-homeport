import { FunctionComponent } from 'react';
import { useAsync } from 'react-use';

import { LoadingSpinner } from '@waldur/core/LoadingSpinner';
import { translate } from '@waldur/i18n';
import { getAllOrganizationGroups } from '@waldur/marketplace/common/api';
import { SetAccessPolicyDialogForm } from '@waldur/marketplace/offerings/actions/SetAccessPolicyDialogForm';
import { Offering, Plan } from '@waldur/marketplace/types';

interface SetAccessPolicyDialogProps {
  resolve: { offering?: Offering; plan?: Plan; refetch: any; customer: any };
}

export const SetAccessPolicyDialog: FunctionComponent<
  SetAccessPolicyDialogProps
> = ({ resolve }) => {
  const {
    loading,
    error,
    value: organizationGroups,
  } = useAsync(async () => await getAllOrganizationGroups(), [resolve]);
  return loading ? (
    <LoadingSpinner />
  ) : error ? (
    <>{translate('Unable to load organization groups.')}</>
  ) : (
    <SetAccessPolicyDialogForm
      organizationGroups={organizationGroups}
      offering={resolve.offering}
      plan={resolve.plan}
      customer={resolve.customer}
      refetch={resolve.refetch}
    />
  );
};
