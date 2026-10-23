import {
  FormbricksFlow,
  proposalFormbricksFlowsDestroy,
} from 'waldur-js-client';

import { formatJsxTemplate, translate } from '@/i18n';
import { useManagedMutation } from '@/modal/useManagedMutation';
import { RemovalActionItem } from '@/resource/actions/RemovalActionItem';

interface FormbricksFlowDeleteActionProps {
  row: FormbricksFlow;
  refetch(): void;
}

export const FormbricksFlowDeleteAction = ({
  row,
  refetch,
}: FormbricksFlowDeleteActionProps) => {
  const deleteMutation = useManagedMutation({
    mutationFn: () =>
      proposalFormbricksFlowsDestroy({ path: { uuid: row.uuid } }),
    successMessage: translate('Formbricks flow has been deleted.'),
    errorMessage: translate('Unable to delete the Formbricks flow.'),
    refetch,
    confirmation: {
      title: translate('Confirmation'),
      body: translate(
        'Are you sure you want to delete the Formbricks flow {name}?',
        { name: <strong>{row.name}</strong> },
        formatJsxTemplate,
      ),
      options: { forDeletion: true },
    },
  });

  const inUse = row.calls_count > 0;

  return (
    <RemovalActionItem
      action={() => deleteMutation.mutate()}
      title={translate('Delete')}
      disabled={inUse || deleteMutation.isPending}
      tooltip={
        inUse
          ? translate('The flow is used by a call. Unset it on the call first.')
          : undefined
      }
    />
  );
};
