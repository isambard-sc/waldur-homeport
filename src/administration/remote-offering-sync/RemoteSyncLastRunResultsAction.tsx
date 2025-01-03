import { Eye } from '@phosphor-icons/react';
import { useDispatch } from 'react-redux';

import { translate } from '@waldur/i18n';
import { openModalDialog } from '@waldur/modal/actions';
import { MetronicModalDialog } from '@waldur/modal/MetronicModalDialog';
import { ActionItem } from '@waldur/resource/actions/ActionItem';

import { RemoteSyncActionProps } from './types';

const LastRunResultDialog = ({ remoteSync }) => {
  return (
    <MetronicModalDialog
      title={translate('Result of last run')}
      subtitle={remoteSync.api_url}
      closeButton
    >
      <pre>{remoteSync.last_output || translate('No results to display.')}</pre>
    </MetronicModalDialog>
  );
};

export const RemoteSyncLastRunResultsAction = (
  props: RemoteSyncActionProps,
) => {
  const dispatch = useDispatch();

  const openDialog = () => {
    dispatch(openModalDialog(LastRunResultDialog, { remoteSync: props.row }));
  };

  return (
    <ActionItem
      title={translate('Show results of last run')}
      action={openDialog}
      iconNode={<Eye />}
    />
  );
};
