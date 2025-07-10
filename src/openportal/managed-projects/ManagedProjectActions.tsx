import { Button } from 'react-bootstrap';

import { ActionsDropdown } from '@waldur/table/ActionsDropdown';

import { ApproveManagedProjectButton } from './ApproveManagedProjectButton';
import { RejectManagedProjectButton } from './RejectManagedProjectButton';

export const ManagedProjectActions = ({
    project,
    refetch,
    as,
}) => {
    console.log('ManagedProjectActions', project, refetch, as);

    if (!project || !refetch) {
        console.warn('ManagedProjectActions: Missing project or refetch function');
        return null;
    }

    if (project.state !== 'pending') {
        return null;
    }

    return as === Button ? (
        <>
            <ApproveManagedProjectButton row={project} refetch={refetch} as={Button} />
            <RejectManagedProjectButton row={project} refetch={refetch} as={Button} />
        </>
    ) : (
        <ActionsDropdown
            row={project}
            refetch={refetch}
            actions={[
                project.state === 'pending' ? ApproveManagedProjectButton : null,
                project.state === 'pending' ? RejectManagedProjectButton : null,
            ].filter(Boolean)}
            data-cy="public-resources-list-actions-dropdown-btn"
        />
    );
};
