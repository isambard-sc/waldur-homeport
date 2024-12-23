import { Plus } from '@phosphor-icons/react';
import { useDispatch, useSelector } from 'react-redux';

import { lazyComponent } from '@waldur/core/lazyComponent';
import { translate } from '@waldur/i18n';
import { openModalDialog } from '@waldur/modal/actions';
import { PermissionEnum } from '@waldur/permissions/enums';
import { hasPermission } from '@waldur/permissions/hasPermission';
import { TableDropdownItem } from '@waldur/table/types';
import { useUser } from '@waldur/workspace/hooks';
import { getCustomer } from '@waldur/workspace/selectors';

import { OFFERING_IMPORT_FORM_ID } from './import/constants';

const OfferingImportDialog = lazyComponent(() =>
  import('./import/OfferingImportDialog').then((module) => ({
    default: module.OfferingImportDialog,
  })),
);

export const useOfferingDropdownActions = (refetch?): TableDropdownItem[] => {
  const dispatch = useDispatch();
  const customer = useSelector(getCustomer);
  const user = useUser();
  const canCreateOffering = hasPermission(user, {
    permission: PermissionEnum.CREATE_OFFERING,
    customerId: customer?.uuid,
  });
  const showOfferingListActions =
    customer && customer.is_service_provider && canCreateOffering;

  if (!showOfferingListActions) {
    return [];
  }

  return [
    {
      label: translate('Import offerings'),
      iconNode: <Plus />,
      action: () => {
        dispatch(
          openModalDialog(OfferingImportDialog, {
            refetch,
            size: 'lg',
            formId: OFFERING_IMPORT_FORM_ID,
          }),
        );
      },
    },
  ];
};
