import { useDispatch } from 'react-redux';

import { lazyComponent } from '@waldur/core/lazyComponent';
import { EditButton } from '@waldur/form/EditButton';
import { openModalDialog } from '@waldur/modal/actions';

const SetAccessPolicyDialog = lazyComponent(() =>
  import('@waldur/marketplace/offerings/actions/SetAccessPolicyDialog').then(
    (module) => ({
      default: module.SetAccessPolicyDialog,
    }),
  ),
);

export const UpdateCustomerOrganizationsGroupsButton = ({
  customer,
  refetch,
}) => {
  const dispatch = useDispatch();
  const callback = () =>
    dispatch(
      openModalDialog(SetAccessPolicyDialog, {
        resolve: {
          customer,
          refetch,
        },
      }),
    );
  return <EditButton onClick={callback} size="sm" />;
};
