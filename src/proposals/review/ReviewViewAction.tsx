import { Eye } from '@phosphor-icons/react';
import { useCurrentStateAndParams } from '@uirouter/react';

import { translate } from '@waldur/i18n';
import { ActionItem } from '@waldur/resource/actions/ActionItem';
import { router } from '@waldur/router';

export const ReviewViewAction = ({ row }) => {
  const { state } = useCurrentStateAndParams();

  const callback = () => {
    router.stateService.go(
      state.parent === 'reviews' ? 'proposal-review-view' : 'proposal-review',
      { review_uuid: row.uuid },
    );
  };

  return (
    <ActionItem
      title={translate('View')}
      action={callback}
      iconNode={<Eye weight="bold" />}
    />
  );
};
