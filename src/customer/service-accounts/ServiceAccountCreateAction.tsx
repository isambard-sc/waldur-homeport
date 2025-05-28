import { Robot } from '@phosphor-icons/react';
import { FC } from 'react';
import { useDispatch } from 'react-redux';

import { lazyComponent } from '@waldur/core/lazyComponent';
import { isFeatureVisible } from '@waldur/features/connect';
import { InvitationsFeatures } from '@waldur/FeaturesEnums';
import { translate } from '@waldur/i18n';
import { openModalDialog } from '@waldur/modal/actions';
import { ActionItem } from '@waldur/resource/actions/ActionItem';

import { ServiceAccountsProps } from './type';

const ServiceAccountFormDialog = lazyComponent(() =>
  import('./ServiceAccountFormDialog').then((module) => ({
    default: module.ServiceAccountFormDialog,
  })),
);

export const ServiceAccountCreateButton: FC<
  ServiceAccountsProps & {
    refetch(): void;
  }
> = ({ context, scope, refetch }) => {
  if (!isFeatureVisible(InvitationsFeatures.show_service_accounts)) {
    return null;
  }
  const dispatch = useDispatch();
  const callback = () =>
    dispatch(
      openModalDialog(ServiceAccountFormDialog, {
        resolve: { context, scope, refetch },
      }),
    );

  return (
    <ActionItem
      title={translate('Service account')}
      action={callback}
      iconNode={<Robot weight="bold" />}
    />
  );
};
