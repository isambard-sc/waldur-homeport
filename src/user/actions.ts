import { lazyComponent } from '@waldur/core/lazyComponent';
import { openModalDialog } from '@waldur/modal/actions';

const UserPopover = lazyComponent(() =>
  import('@waldur/user/UserPopover').then((module) => ({
    default: module.UserPopover,
  })),
);

export const openUserPopover = (resolve) =>
  openModalDialog(UserPopover, { resolve, size: 'lg' });
