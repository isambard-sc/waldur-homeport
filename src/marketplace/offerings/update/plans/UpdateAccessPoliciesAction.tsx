import { Users } from '@phosphor-icons/react';
import { useCallback } from 'react';
import { useDispatch } from 'react-redux';

import { lazyComponent } from '@waldur/core/lazyComponent';
import { translate } from '@waldur/i18n';
import { useOrganizationGroups } from '@waldur/marketplace/common/utils';
import { openModalDialog } from '@waldur/modal/actions';
import { ActionItem } from '@waldur/resource/actions/ActionItem';

const SetAccessPolicyDialog = lazyComponent(() =>
  import('../../actions/SetAccessPolicyDialog').then((module) => ({
    default: module.SetAccessPolicyDialog,
  })),
);

export const UpdateAccessPoliciesAction = ({ plan, refetch }) => {
  const {
    data: organizationGroups,
    isLoading,
    isError,
    disabled,
    tooltip,
    refetch: refetchGroups,
  } = useOrganizationGroups();

  const dispatch = useDispatch();
  const callback = useCallback(
    () =>
      dispatch(
        openModalDialog(SetAccessPolicyDialog, {
          resolve: {
            organizationGroups,
            loading: isLoading,
            error: isError,
            plan,
            refetch,
            refetchGroups,
          },
        }),
      ),
    [dispatch],
  );

  return (
    <ActionItem
      title={translate('Update access policies')}
      iconNode={<Users />}
      action={callback}
      disabled={disabled}
      tooltip={tooltip}
    />
  );
};
