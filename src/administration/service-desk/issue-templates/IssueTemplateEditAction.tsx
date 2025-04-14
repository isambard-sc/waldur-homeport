import { FunctionComponent } from 'react';
import { useDispatch } from 'react-redux';

import { lazyComponent } from '@waldur/core/lazyComponent';
import { EditAction } from '@waldur/form/EditAction';
import { openModalDialog } from '@waldur/modal/actions';

const TemplateEditDialog = lazyComponent(() =>
  import('./IssueTemplateForm').then((module) => ({
    default: module.IssueTemplateForm,
  })),
);

export const IssueTemplateEditAction: FunctionComponent<{
  row;
  refetch;
}> = ({ row, refetch }) => {
  const dispatch = useDispatch();
  const callback = () => {
    dispatch(
      openModalDialog(TemplateEditDialog, {
        dialogClassName: 'modal-dialog-centered',
        resolve: { issueTemplate: row, refetch },
        size: 'lg',
      }),
    );
  };
  return <EditAction action={callback} size="sm" />;
};
