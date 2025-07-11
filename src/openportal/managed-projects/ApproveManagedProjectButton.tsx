import { CheckCircleIcon } from '@phosphor-icons/react';
import { useMutation } from '@tanstack/react-query';
import { useDispatch, useSelector } from 'react-redux';

import { post } from '@waldur/core/api';
import { LoadingSpinnerIcon } from '@waldur/core/LoadingSpinner';
import { translate } from '@waldur/i18n';
import { ActionItem } from '@waldur/resource/actions/ActionItem';
import { showErrorResponse, showSuccess } from '@waldur/store/notify';
import { wrapTooltip } from '@waldur/table/ActionButton';
import { getUser } from '@waldur/workspace/selectors';

export const approveManagedProject = async ({ path }) => {
    await post(`/openportal-managed-projects/${path.identifier}/approve/`);
}

export const ApproveManagedProjectButton = ({ row, as, className, refetch }) => {
    const project = row; // Assuming row is the project object

    if (!project || !refetch) {
        console.warn('ApproveManagedProjectButton: Missing project or refetch function');
        return null;
    }

    const user = useSelector(getUser);
    const dispatch = useDispatch();
    const { mutate, isPending: isLoading } = useMutation({
        mutationFn: async () => {
            try {
                await approveManagedProject({
                    path: { identifier: project.identifier },
                });
                if (refetch) {
                    await refetch();
                }
                dispatch(showSuccess(translate('Project has been approved.')));
            } catch (error) {
                dispatch(
                    showErrorResponse(error, translate('Unable to approve project.')),
                );
            }
        },
    });
    if (!user.is_staff) {
        console.log('User is not staff, skipping approval button');
        return null;
    }
    return wrapTooltip(
        translate('Click to approve this project.'),
        <>
            {isLoading ? (
                <LoadingSpinnerIcon className="me-1" />
            ) : (
                <ActionItem
                    as={as}
                    className={className + ' w-100'}
                    title={translate('Approve')}
                    action={mutate}
                    disabled={isLoading}
                    iconNode={<CheckCircleIcon weight="bold" />}
                    size="sm"
                />
            )}
        </>,
    );
};
