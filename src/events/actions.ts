import { lazyComponent } from '@waldur/core/lazyComponent';
import { openModalDialog } from '@waldur/modal/actions';

const EventTypesDialog = lazyComponent(() =>
  import('./EventTypesDialog').then((module) => ({
    default: module.EventTypesDialog,
  })),
);

export const showEventTypes = () => openModalDialog(EventTypesDialog);
