import { CheckCircleIcon } from '@phosphor-icons/react';
import { useMutation } from '@tanstack/react-query';
import { useDispatch, useSelector } from 'react-redux';

import { LoadingSpinnerIcon } from '@waldur/core/LoadingSpinner';
import { translate } from '@waldur/i18n';
import { ActionItem } from '@waldur/resource/actions/ActionItem';
import { showErrorResponse, showSuccess } from '@waldur/store/notify';
import { wrapTooltip } from '@waldur/table/ActionButton';
import { getUser } from '@waldur/workspace/selectors';

export const approveManagedProject = async ({ path }) => {
    const response = await fetch(`/api/openportal-managed-projects/${path.uuid}/approve/`, {
        method: 'POST',
        headers: {
            'Content-Type': 'application/json',
        },
    });
    if (!response.ok) {
        throw new Error(`Failed to approve project: ${response.statusText}`);
    }
    return response.json();
}

export const ApproveManagedProjectButton = ({ row, as, className, refetch }) => {
    const project = row; // Assuming row is the project object

    if (!project || !refetch) {
        console.warn('RejectManagedProjectButton: Missing project or refetch function');
        return null;
    }

    const user = useSelector(getUser);
    const dispatch = useDispatch();
    const { mutate, isPending: isLoading } = useMutation({
        mutationFn: async () => {
            try {
                await approveManagedProject({
                    path: { uuid: project.uuid },
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
