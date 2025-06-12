import { PencilIcon } from '@phosphor-icons/react';

import { translate } from '@waldur/i18n';
import { ActionItem } from '@waldur/resource/actions/ActionItem';

export const EditAction = (props) => {
  return (
    <ActionItem
      title={translate('Edit')}
      iconNode={<PencilIcon weight="bold" />}
      {...props}
    />
  );
};
