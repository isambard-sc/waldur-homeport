import { useDispatch } from 'react-redux';

import { lazyComponent } from '@waldur/core/lazyComponent';
import { EditAction } from '@waldur/form/EditAction';
import { openModalDialog } from '@waldur/modal/actions';

const UserAgreementsEditDialog = lazyComponent(() =>
  import('./UserAgreementsEditDialog').then((module) => ({
    default: module.UserAgreementsEditDialog,
  })),
);

export const UserAgreementsEditButton = ({ row, refetch }) => {
  const dispatch = useDispatch();
  const callback = () =>
    dispatch(
      openModalDialog(UserAgreementsEditDialog, {
        resolve: {
          initialValues: {
            url: row.url,
            agreement_type: row.agreement_type,
            content: row.content,
          },
          refetch,
        },
        size: 'lg',
      }),
    );
  return <EditAction action={callback} size="sm" />;
};
