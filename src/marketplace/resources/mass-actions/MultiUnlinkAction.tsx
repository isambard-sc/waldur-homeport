import { LinkBreak } from '@phosphor-icons/react';
import { useCallback } from 'react';
import { useDispatch } from 'react-redux';

import { translate } from '@waldur/i18n';
import { unlinkResource } from '@waldur/marketplace/common/api';
import { waitForConfirmation } from '@waldur/modal/actions';
import { ActionItem } from '@waldur/resource/actions/ActionItem';

export const MultiUnlinkAction = ({ rows, refetch }) => {
  const dispatch = useDispatch();
  const callback = useCallback(async () => {
    try {
      await waitForConfirmation(
        dispatch,
        translate('Perform mass action'),
        translate('Are you sure you want to unlink {count} resources?', {
          count: rows.length,
        }),
      );
    } catch {
      return;
    }
    Promise.all(rows.map((resource) => unlinkResource(resource.uuid))).then(
      () => {
        refetch();
      },
    );
  }, [dispatch, rows, refetch]);
  return (
    <ActionItem
      title={translate('Unlink')}
      action={callback}
      className="text-danger"
      staff
      iconNode={<LinkBreak />}
    />
  );
};
