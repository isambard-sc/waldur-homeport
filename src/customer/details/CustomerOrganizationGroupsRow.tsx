import { useDispatch } from 'react-redux';

import FormTable from '@waldur/form/FormTable';
import { translate } from '@waldur/i18n';
import { getCustomer } from '@waldur/project/api';
import { showErrorResponse } from '@waldur/store/notify';
import { setCurrentCustomer } from '@waldur/workspace/actions';

import { UpdateCustomerOrganizationsGroupsButton } from './UpdateCustomerOrganizationsGroupsButton';

export const CustomerOrganizationGroupsRow = (props) => {
  const dispatch = useDispatch();
  const updateCustomerData = async () => {
    try {
      const currentCustomer = await getCustomer(props.customer.uuid);
      dispatch(setCurrentCustomer(currentCustomer));
    } catch (error) {
      dispatch(
        showErrorResponse(
          error,
          translate('Unable to update organization groups.'),
        ),
      );
    }
  };
  return (
    <FormTable.Item
      label={translate('Organization groups')}
      value={props.customer.organization_groups
        .map(
          (group) =>
            `${group.parent_name ? `${group.parent_name} ➔ ` : ''}${group.name}`,
        )
        .join(', ')}
      actions={
        <UpdateCustomerOrganizationsGroupsButton
          customer={props.customer}
          refetch={updateCustomerData}
        />
      }
    />
  );
};
