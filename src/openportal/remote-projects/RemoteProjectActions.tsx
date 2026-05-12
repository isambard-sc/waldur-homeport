import {
  CalendarBlankIcon,
  GlobeIcon,
  LinkIcon,
  NoteIcon,
  UsersIcon,
} from '@phosphor-icons/react';
import { useDispatch } from 'react-redux';

import { translate } from '@waldur/i18n';
import { openModalDialog } from '@waldur/modal/actions';
import { ActionItem } from '@waldur/resource/actions/ActionItem';
import { ActionsDropdown } from '@waldur/table/ActionsDropdown';

import { AddNoteDialog } from './actions/AddNoteDialog';
import { ApproveNowButton } from './actions/ApproveNowButton';
import { HoldIndefinitelyButton } from './actions/HoldIndefinitelyButton';
import { SetAllowedDomainsDialog } from './actions/SetAllowedDomainsDialog';
import { SetEarliestApproveDialog } from './actions/SetEarliestApproveDialog';
import { SetLinksDialog } from './actions/SetLinksDialog';
import { SetMembershipControlDialog } from './actions/SetMembershipControlDialog';

const openDialog = (dispatch, Component, row, refetch) =>
  dispatch(
    openModalDialog(Component, {
      row,
      resolve: { refetch },
      dialogClassName: 'modal-dialog-centered',
    }),
  );

export const RemoteProjectActions = ({ row, refetch }) => {
  const dispatch = useDispatch();

  return (
    <ActionsDropdown
      row={row}
      refetch={refetch}
      actions={[
        ApproveNowButton,
        HoldIndefinitelyButton,
        ({ row, refetch }) => (
          <ActionItem
            title={translate('Add note')}
            iconNode={<NoteIcon weight="bold" />}
            action={() => openDialog(dispatch, AddNoteDialog, row, refetch)}
          />
        ),
        ({ row, refetch }) => (
          <ActionItem
            title={translate('Set embargo date')}
            iconNode={<CalendarBlankIcon weight="bold" />}
            action={() =>
              openDialog(dispatch, SetEarliestApproveDialog, row, refetch)
            }
          />
        ),
        ({ row, refetch }) => (
          <ActionItem
            title={translate('Set membership control')}
            iconNode={<UsersIcon weight="bold" />}
            action={() =>
              openDialog(dispatch, SetMembershipControlDialog, row, refetch)
            }
          />
        ),
        ({ row, refetch }) => (
          <ActionItem
            title={translate('Set allowed domains')}
            iconNode={<GlobeIcon weight="bold" />}
            action={() =>
              openDialog(dispatch, SetAllowedDomainsDialog, row, refetch)
            }
          />
        ),
        ({ row, refetch }) => (
          <ActionItem
            title={translate('Set links')}
            iconNode={<LinkIcon weight="bold" />}
            action={() => openDialog(dispatch, SetLinksDialog, row, refetch)}
          />
        ),
      ]}
    />
  );
};
