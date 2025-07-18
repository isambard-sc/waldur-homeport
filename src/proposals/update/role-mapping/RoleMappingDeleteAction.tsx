import { TrashIcon } from '@phosphor-icons/react';
import { FunctionComponent } from 'react';
import { useDispatch } from 'react-redux';
import { callProposalProjectRoleMappingsDestroy } from 'waldur-js-client';

import { translate } from '@waldur/i18n';
import { waitForConfirmation } from '@waldur/modal/actions';
import { ActionItem } from '@waldur/resource/actions/ActionItem';
import { showSuccess, showErrorResponse } from '@waldur/store/notify';

export const RoleMappingDeleteAction: FunctionComponent<{ row; refetch }> = ({
  row,
  refetch,
}) => {
  const dispatch = useDispatch();

  const callback = async () => {
    try {
      await waitForConfirmation(
        dispatch,
        translate('Delete mapping'),
        translate('Are you sure you would like to delete the mapping?'),
        { forDeletion: true },
      );
    } catch {
      return;
    }
    try {
      await callProposalProjectRoleMappingsDestroy({
        path: { uuid: row.uuid },
      });
      await refetch();
      dispatch(showSuccess(translate('Mapping has been deleted.')));
    } catch (e) {
      dispatch(showErrorResponse(e, translate('Unable to delete mapping.')));
    }
  };

  return (
    <ActionItem
      title={translate('Delete')}
      action={callback}
      iconNode={<TrashIcon weight="bold" />}
      iconColor="danger"
      className="text-danger"
    />
  );
};
