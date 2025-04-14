import { FunctionComponent } from 'react';
import { useDispatch } from 'react-redux';

import { AddButton } from '@waldur/core/AddButton';
import { lazyComponent } from '@waldur/core/lazyComponent';
import { openModalDialog } from '@waldur/modal/actions';

const TemplateCreateDialog = lazyComponent(() =>
  import('./IssueTemplateForm').then((module) => ({
    default: module.IssueTemplateForm,
  })),
);

export const IssueTemplateCreateButton: FunctionComponent<{ refetch }> = ({
  refetch,
}) => {
  const dispatch = useDispatch();
  const callback = () =>
    dispatch(
      openModalDialog(TemplateCreateDialog, {
        dialogClassName: 'modal-dialog-centered',
        resolve: {
          refetch,
        },
        size: 'lg',
      }),
    );
  return <AddButton action={callback} />;
};
