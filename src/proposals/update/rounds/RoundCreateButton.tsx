import { useCallback } from 'react';
import { useDispatch } from 'react-redux';

import { AddButton } from '@waldur/core/AddButton';
import { lazyComponent } from '@waldur/core/lazyComponent';
import { openModalDialog } from '@waldur/modal/actions';
import { Call } from '@waldur/proposals/types';

const CallRoundCreateDialog = lazyComponent(() =>
  import('./CallRoundCreateDialog').then((module) => ({
    default: module.CallRoundCreateDialog,
  })),
);

interface RoundCreateButtonProps {
  call: Call;
  refetch(): void;
}

export const RoundCreateButton = ({
  call,
  refetch,
}: RoundCreateButtonProps) => {
  const dispatch = useDispatch();
  const openRoundCreateDialog = useCallback(
    () =>
      dispatch(
        openModalDialog(CallRoundCreateDialog, {
          resolve: { call, refetch },
          size: 'lg',
        }),
      ),
    [dispatch],
  );

  return <AddButton action={openRoundCreateDialog} />;
};
