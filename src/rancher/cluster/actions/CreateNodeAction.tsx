import { PlusCircle } from '@phosphor-icons/react';
import { FC } from 'react';

import { ENV } from '@waldur/configs/default';
import { lazyComponent } from '@waldur/core/lazyComponent';
import { translate } from '@waldur/i18n';
import { Cluster } from '@waldur/rancher/types';
import { DialogActionButton } from '@waldur/resource/actions/DialogActionButton';

const CreateNodeDialog = lazyComponent(() =>
  import('../create/CreateNodeDialog').then((module) => ({
    default: module.CreateNodeDialog,
  })),
);

export const CreateNodeAction: FC<{ resource: Cluster }> = ({ resource }) =>
  !ENV.plugins.WALDUR_RANCHER.READ_ONLY_MODE && Boolean(resource.tenant) ? (
    <DialogActionButton
      title={translate('Create node')}
      iconNode={<PlusCircle />}
      modalComponent={CreateNodeDialog}
      resource={resource}
    />
  ) : null;
