import { CloudX } from '@phosphor-icons/react';
import { useCallback } from 'react';
import { useDispatch } from 'react-redux';

import { translate } from '@waldur/i18n';
import { setErredResource } from '@waldur/marketplace/common/api';
import { waitForConfirmation } from '@waldur/modal/actions';
import { ActionItem } from '@waldur/resource/actions/ActionItem';

export const MultiSetErredAction = ({ rows, refetch }) => {
  const dispatch = useDispatch();
  const callback = useCallback(async () => {
    try {
      await waitForConfirmation(
        dispatch,
        translate('Perform mass action'),
        translate('Are you sure you want to set {count} resources to erred?', {
          count: rows.length,
        }),
      );
    } catch {
      return;
    }
    Promise.all(rows.map((resource) => setErredResource(resource.uuid))).then(
      () => {
        refetch();
      },
    );
  }, [dispatch, rows, refetch]);
  return (
    <ActionItem
      title={translate('Set erred')}
      action={callback}
      className="text-danger"
      iconNode={<CloudX />}
      staff
    />
  );
};
