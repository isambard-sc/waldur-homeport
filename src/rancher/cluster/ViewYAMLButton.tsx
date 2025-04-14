import { PencilSimple } from '@phosphor-icons/react';
import { useDispatch } from 'react-redux';

import { lazyComponent } from '@waldur/core/lazyComponent';
import { translate } from '@waldur/i18n';
import { openModalDialog } from '@waldur/modal/actions';
import { RowActionButton } from '@waldur/table/ActionButton';

const ViewYAMLDialog = lazyComponent(() =>
  import('./ViewYAMLDialog').then((module) => ({
    default: module.ViewYAMLDialog,
  })),
);

export const ViewYAMLButton = ({
  resource,
  disabled,
  yamlRetrieve,
  yamlUpdate,
}: {
  resource: any;
  disabled?: boolean;
  yamlRetrieve: any;
  yamlUpdate: any;
}) => {
  const dispatch = useDispatch();
  return (
    <RowActionButton
      title={translate('View YAML')}
      action={() =>
        dispatch(
          openModalDialog(ViewYAMLDialog, {
            resolve: { resource, yamlRetrieve, yamlUpdate },
            size: 'lg',
          }),
        )
      }
      iconNode={<PencilSimple />}
      disabled={disabled}
      size="sm"
    />
  );
};
