import { useDispatch } from 'react-redux';

import { lazyComponent } from '@waldur/core/lazyComponent';
import { EditAction } from '@waldur/form/EditAction';
import { openModalDialog } from '@waldur/modal/actions';

const ProjectTemplateEditDialog = lazyComponent(() =>
  import('./ProjectTemplateEditDialog').then((module) => ({
    default: module.ProjectTemplateEditDialog,
  })),
);

export const ProjectTemplateEditButton = ({ row, refetch }) => {
  const dispatch = useDispatch();
  const callback = () =>
    dispatch(
      openModalDialog(ProjectTemplateEditDialog, {
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
