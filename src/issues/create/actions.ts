import { lazyComponent } from '@waldur/core/lazyComponent';
import { openModalDialog } from '@waldur/modal/actions';

const IssueCreateDialog = lazyComponent(() =>
  import('@waldur/issues/create/IssueCreateDialog').then((module) => ({
    default: module.IssueCreateDialog,
  })),
);

export const openIssueCreateDialog = (resolve) =>
  openModalDialog(IssueCreateDialog, {
    resolve,
    dialogClassName: 'modal-dialog-centered mw-650px',
  });
