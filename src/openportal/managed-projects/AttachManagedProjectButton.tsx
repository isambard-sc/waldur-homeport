import { useAsyncFn } from 'react-use';
import { FC } from 'react';
import { useDispatch } from 'react-redux';

import { translate } from '@waldur/i18n';
import { ActionItem } from '@waldur/resource/actions/ActionItem';
import { showErrorResponse, showSuccess } from '@waldur/store/notify';

export const AttachManagedProjectButton: FC<{ row; refetch }> = ({
    row,
    refetch,
}) => {
    const project = row; // Assuming row is the project object

    if (!project) {
        return null;
    }

    const dispatch = useDispatch();
    const callback = () =>
        dispatch(
            openModalDialog(AttachManagedProjectDialog, {
                dialogClassName: 'modal-dialog-centered',
                resolve: {
                    refetch,
                },
                size: 'lg',
            }),
        );

    return (
        <ActionItem
            title={translate('Attach Project')}
            disabled={loading}
            action={callback}
            size="sm"
        />
    );
};
