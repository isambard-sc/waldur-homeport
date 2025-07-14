import { useDispatch } from 'react-redux';

import { lazyComponent } from '@waldur/core/lazyComponent';
import { EditAction } from '@waldur/form/EditAction';
import { openModalDialog } from '@waldur/modal/actions';

const ProjectClassEditDialog = lazyComponent(() =>
  import('./ProjectClassEditDialog').then((module) => ({
    default: module.ProjectClassEditDialog,
  })),
);

export const ProjectClassEditButton = ({ row, refetch }) => {
  const dispatch = useDispatch();
  const callback = () =>
    dispatch(
      openModalDialog(ProjectClassEditDialog, {
        resolve: {
          initialValues: {
            uuid: row.uuid,
            content: row.content,
          },
          refetch,
        },
        size: 'lg',
      }),
    );
  return <EditAction action={callback} size="sm" />;
};
