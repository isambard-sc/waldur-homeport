import { lazyComponent } from '@waldur/core/lazyComponent';
import { openModalDialog } from '@waldur/modal/actions';

const OfferingDetailsDialog = lazyComponent(() =>
  import('./OfferingDetailsDialog').then((module) => ({
    default: module.OfferingDetailsDialog,
  })),
);

export const openOfferingDetailsDialog = (offering: any) =>
  openModalDialog(OfferingDetailsDialog, {
    resolve: { offering },
    size: 'lg',
  });
