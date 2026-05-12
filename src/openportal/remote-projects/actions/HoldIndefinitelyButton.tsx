import { ClockIcon } from '@phosphor-icons/react';
import { useMutation } from '@tanstack/react-query';
import { useDispatch } from 'react-redux';
import { openportalRemoteProjectsHoldIndefinitely } from 'waldur-js-client';

import { translate } from '@waldur/i18n';
import { ActionItem } from '@waldur/resource/actions/ActionItem';
import { showErrorResponse, showSuccess } from '@waldur/store/notify';

export const HoldIndefinitelyButton = ({ row, refetch }) => {
  const dispatch = useDispatch();
  const { mutate, isPending } = useMutation({
    mutationFn: () =>
      openportalRemoteProjectsHoldIndefinitely({
        path: { uuid: row.uuid },
        body: { destination: row.destination, identifier: row.identifier },
      }),
    onSuccess: async () => {
      dispatch(showSuccess(translate('Remote project is now held indefinitely.')));
      await refetch();
    },
    onError: (error) =>
      dispatch(showErrorResponse(error, translate('Unable to hold remote project.'))),
  });

  return (
    <ActionItem
      title={translate('Hold indefinitely')}
      action={() => mutate()}
      disabled={isPending}
      iconNode={<ClockIcon weight="bold" />}
    />
  );
};
