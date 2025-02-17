import { FileCode } from '@phosphor-icons/react';
import { useSelector } from 'react-redux';

import { lazyComponent } from '@waldur/core/lazyComponent';
import { translate } from '@waldur/i18n';
import { OpenStackInstance } from '@waldur/openstack/openstack-instance/types';
import { DialogActionItem } from '@waldur/resource/actions/DialogActionItem';
import { ActionContext, ActionItemType } from '@waldur/resource/actions/types';
import { getUser } from '@waldur/workspace/selectors';

const RancherClusterKubeconfigDialog = lazyComponent(() =>
  import('./RancherClusterKubeconfigDialog').then((module) => ({
    default: module.RancherClusterKubeconfigDialog,
  })),
);

function validate(ctx: ActionContext<OpenStackInstance>): string {
  if (ctx.resource.state !== 'OK') {
    return translate('Instance should be OK. Please contact support.');
  }
}

const validators = [validate];

export const KubeconfigFileAction: ActionItemType = ({ resource }) => {
  const user = useSelector(getUser);
  if (!user.is_staff) {
    return null;
  }
  return (
    <DialogActionItem
      title={translate('Generate Kubeconfig file')}
      modalComponent={RancherClusterKubeconfigDialog}
      resource={resource}
      validators={validators}
      iconNode={<FileCode />}
    />
  );
};
