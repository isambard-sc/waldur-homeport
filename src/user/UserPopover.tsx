import { FunctionComponent } from 'react';
import { useSelector } from 'react-redux';
import { useAsyncFn, useEffectOnce } from 'react-use';
import { createSelector } from 'reselect';
import {
  freeipaProfilesList,
  FreeipaProfile,
  usersRetrieve,
} from 'waldur-js-client';

import { ENV } from '@waldur/core/config';
import { countChecklists } from '@waldur/marketplace-checklist/utils';
import { isSupport, isStaff, isOwner } from '@waldur/workspace/selectors';

import { UserDetailsDialog } from './support/UserDetailsDialog';

const getCanSeeChecklist = createSelector(
  isSupport,
  isStaff,
  isOwner,
  (support, staff, owner) => support || staff || owner,
);

export const UserPopover: FunctionComponent<{ resolve }> = ({ resolve }) => {
  const [{ loading, error, value }, callback] = useAsyncFn(async () => {
    let user;
    if (resolve.user_uuid) {
      user = (await usersRetrieve({ path: { uuid: resolve.user_uuid } })).data;
    } else {
      user = resolve.user;
    }
    const checklistCount = await countChecklists();
    let profile: FreeipaProfile = null;
    if (ENV.plugins.WALDUR_CORE.FREEIPA_ENABLED) {
      profile = await freeipaProfilesList({ query: { user: user.uuid } }).then(
        (r) => r.data[0],
      );
    }
    return { user, checklistCount, profile };
  }, [resolve]);

  useEffectOnce(() => {
    callback();
  });

  const canSeeChecklist = useSelector(getCanSeeChecklist);

  return (
    <UserDetailsDialog
      resolve={{
        user: value?.user,
        showChecklists: Boolean(canSeeChecklist && value?.checklistCount),
        loading,
        error,
        refetch: callback,
      }}
    />
  );
};
