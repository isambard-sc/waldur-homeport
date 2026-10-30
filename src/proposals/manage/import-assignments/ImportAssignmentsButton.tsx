import { FileArrowUpIcon } from '@phosphor-icons/react';
import { FC } from 'react';

import { BaseButton } from 'waldur-ui';

import { lazyComponent } from '@/core/lazyComponent';
import { translate } from '@/i18n';
import { useModal } from '@/modal/actions';
import { PermissionEnum } from '@/permissions/enums';
import { hasPermission } from '@/permissions/hasPermission';
import { Call } from '@/proposals/types';
import { useUser } from '@/workspace/hooks';

const ImportAssignmentsDialog = lazyComponent(() =>
  import('./ImportAssignmentsDialog').then((module) => ({
    default: module.ImportAssignmentsDialog,
  })),
);

/**
 * Opens the CSV import of review assignments, for those who manage the
 * call's reviews; hidden for anyone else, whom the backend refuses.
 */
export const ImportAssignmentsButton: FC<{
  call: Call;
  roundUuid?: string;
  refetch?(): void;
}> = ({ call, roundUuid, refetch }) => {
  const user = useUser();
  const { openDialog } = useModal();
  const allowed =
    user?.is_staff ||
    hasPermission(user, {
      permission: PermissionEnum.MANAGE_PROPOSAL_REVIEW,
      scopeId: call.uuid,
      callOrganizerId: call.manager_uuid,
    });
  if (!allowed) return null;
  return (
    <BaseButton
      variant="tertiary"
      iconNode={<FileArrowUpIcon weight="bold" />}
      label={translate('Import assignments')}
      onClick={() =>
        openDialog(ImportAssignmentsDialog, {
          resolve: { call, roundUuid, refetch },
          size: 'xl',
        })
      }
    />
  );
};
