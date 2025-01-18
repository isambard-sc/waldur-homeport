import { PlusCircle } from '@phosphor-icons/react';

import { lazyComponent } from '@waldur/core/lazyComponent';
import { translate } from '@waldur/i18n';
import { useModal } from '@waldur/modal/hooks';
import { ActionButton } from '@waldur/table/ActionButton';

const AccessSubnetCreateForm = lazyComponent(() =>
  import('./AccessSubnetCreateForm').then((module) => ({
    default: module.AccessSubnetCreateForm,
  })),
);

export const AccessSubnetCreateButton = ({ refetch, customer_url }) => {
  const { openDialog } = useModal();
  return (
    <ActionButton
      title={translate('Add access subnet')}
      action={() =>
        openDialog(AccessSubnetCreateForm, {
          refetch,
          customer_url,
          size: 'md',
        })
      }
      iconNode={<PlusCircle />}
      variant="primary"
    />
  );
};
