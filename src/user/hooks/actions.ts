import { lazyComponent } from '@waldur/core/lazyComponent';
import { openModalDialog } from '@waldur/modal/actions';

const HookDetailsDialog = lazyComponent(
  () => import('./HookDetailsDialog'),
  'HookDetailsDialog',
);

export const showHookUpdateDialog = (resolve) =>
  openModalDialog(HookDetailsDialog, {
    resolve,
    size: 'md',
  });
