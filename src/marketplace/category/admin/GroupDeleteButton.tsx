import { Trash } from '@phosphor-icons/react';
import { useCallback, useState } from 'react';
import { useDispatch } from 'react-redux';

import { formatJsxTemplate, translate } from '@waldur/i18n';
import { CategoryGroup } from '@waldur/marketplace/types';
import { waitForConfirmation } from '@waldur/modal/actions';
import { ActionItem } from '@waldur/resource/actions/ActionItem';
import { showErrorResponse } from '@waldur/store/notify';

import { removeCategoryGroup } from './api';

interface GroupDeleteButtonProps {
  row: CategoryGroup;
  refetch;
}

export const GroupDeleteButton = (props: GroupDeleteButtonProps) => {
  const dispatch = useDispatch();
  const [removing, setRemoving] = useState(false);

  const openDialog = useCallback(async () => {
    try {
      await waitForConfirmation(
        dispatch,
        translate('Confirmation'),
        translate(
          'Are you sure you want to delete the {title} category group?',
          { title: <strong>{props.row.title}</strong> },
          formatJsxTemplate,
        ),
        { forDeletion: true },
      );
    } catch {
      return;
    }
    try {
      setRemoving(true);
      await removeCategoryGroup(props.row.uuid);
      props.refetch();
    } catch (e) {
      dispatch(
        showErrorResponse(e, translate('Unable to remove category group.')),
      );
      setRemoving(false);
    }
  }, [dispatch, setRemoving, props]);

  return (
    <ActionItem
      title={translate('Remove')}
      action={openDialog}
      iconNode={<Trash />}
      disabled={removing}
      size="sm"
      className="text-danger"
      iconColor="danger"
    />
  );
};
