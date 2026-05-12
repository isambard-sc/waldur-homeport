import { CheckCircleIcon } from '@phosphor-icons/react';
import { useMutation } from '@tanstack/react-query';
import { useDispatch } from 'react-redux';
import { openportalRemoteProjectsApproveNow } from 'waldur-js-client';

import { translate } from '@waldur/i18n';
import { ActionItem } from '@waldur/resource/actions/ActionItem';
import { showErrorResponse, showSuccess } from '@waldur/store/notify';

export const ApproveNowButton = ({ row, refetch }) => {
  const dispatch = useDispatch();
  const { mutate, isPending } = useMutation({
    mutationFn: () =>
      openportalRemoteProjectsApproveNow({
        path: { uuid: row.uuid },
        body: { destination: row.destination, identifier: row.identifier },
      }),
    onSuccess: async () => {
      dispatch(showSuccess(translate('Remote project will be approved immediately.')));
      await refetch();
    },
    onError: (error) =>
      dispatch(showErrorResponse(error, translate('Unable to approve remote project.'))),
  });

  return (
    <ActionItem
      title={translate('Approve now')}
      action={() => mutate()}
      disabled={isPending}
      iconNode={<CheckCircleIcon weight="bold" />}
    />
  );
};
