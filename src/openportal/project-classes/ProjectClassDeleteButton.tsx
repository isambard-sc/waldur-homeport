import { TrashIcon } from '@phosphor-icons/react';
import { FC, useState } from 'react';
import { useDispatch } from 'react-redux';

import { translate } from '@waldur/i18n';
import { waitForConfirmation } from '@waldur/modal/actions';
import { ActionItem } from '@waldur/resource/actions/ActionItem';
import { showErrorResponse, showSuccess } from '@waldur/store/notify';

const projectClassDestroy = (params) => {
  console.log('Deleting project class with params:', params);
  return null;
}

export const ProjectClassDeleteButton: FC<{ row; refetch }> = ({
  row,
  refetch,
}) => {
  const [removing, setRemoving] = useState(false);
  const dispatch = useDispatch();

  const action = async () => {
    try {
      await waitForConfirmation(
        dispatch,
        translate('Delete project class'),
        translate('Are you sure you would like to delete the project class?'),
        { forDeletion: true },
      );
    } catch {
      return;
    }
    try {
      setRemoving(true);
      await projectClassDestroy({ path: { uuid: row.uuid } });
      await refetch();
      dispatch(showSuccess(translate('Project class has been deleted.')));
    } catch (e) {
      dispatch(
        showErrorResponse(e, translate('Unable to delete the project class.')),
      );
    }
    setRemoving(false);
  };

  return (
    <ActionItem
      title={translate('Delete')}
      action={action}
      iconNode={<TrashIcon weight="bold" />}
      size="sm"
      disabled={removing}
      className="text-danger"
      iconColor="danger"
    />
  );
};
