import { CheckCircleIcon } from '@phosphor-icons/react';
import { useMutation } from '@tanstack/react-query';
import { useDispatch } from 'react-redux';

import { post } from '../api';
import { LoadingSpinnerIcon } from '@waldur/core/LoadingSpinner';
import { formatDateTime } from '@waldur/core/dateUtils';
import { translate } from '@waldur/i18n';
import { ActionItem } from '@waldur/resource/actions/ActionItem';
import { showErrorResponse, showSuccess } from '@waldur/store/notify';
import { wrapTooltip } from '@waldur/table/ActionButton';

import { embargoedUntil } from './utils';

export const ApproveManagedProjectButton = ({ row, as, className, refetch }) => {
    const project = row; // Assuming row is the project object

    if (!project) {
        return null;
    }

    const dispatch = useDispatch();
    const embargo = embargoedUntil(project);
    const { mutate, isPending: isLoading } = useMutation({
        mutationFn: async () => {
            try {
                await post(`/openportal-managed-projects/${project.identifier}/${project.destination}/approve/`);
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

    const tooltip = embargo
        ? translate('Embargoed until {{date}} — cannot approve yet.', { date: formatDateTime(embargo) })
        : translate('Click to approve this project.');

    return wrapTooltip(
        tooltip,
        <>
            {isLoading ? (
                <LoadingSpinnerIcon className="me-1" />
            ) : (
                <ActionItem
                    as={as}
                    className={className + ' w-100'}
                    title={translate('Approve')}
                    action={mutate}
                    disabled={isLoading || !!embargo}
                    iconNode={<CheckCircleIcon weight="bold" />}
                    size="sm"
                />
            )}
        </>,
    );
};
