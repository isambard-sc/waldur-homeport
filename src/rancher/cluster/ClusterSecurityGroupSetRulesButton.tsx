import { lazyComponent } from '@waldur/core/lazyComponent';
import { translate } from '@waldur/i18n';
import { DialogActionButton } from '@waldur/resource/actions/DialogActionButton';
import { ActionItemType } from '@waldur/resource/actions/types';

const ClusterSecurityGroupSetRulesDialog = lazyComponent(() =>
  import('./ClusterSecurityGroupSetRulesDialog').then((module) => ({
    default: module.ClusterSecurityGroupSetRulesDialog,
  })),
);

export const ClusterSecurityGroupSetRulesButton: ActionItemType = ({
  resource,
  refetch,
}) => (
  <DialogActionButton
    resource={resource}
    title={translate('Set rules')}
    modalComponent={ClusterSecurityGroupSetRulesDialog}
    extraResolve={{ refetch }}
    dialogSize="lg"
  />
);
