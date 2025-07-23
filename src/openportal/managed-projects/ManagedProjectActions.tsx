import { Button } from 'react-bootstrap';

import { ActionsDropdown } from '@waldur/table/ActionsDropdown';

import { ApproveManagedProjectButton } from './ApproveManagedProjectButton';
import { RejectManagedProjectButton } from './RejectManagedProjectButton';
import { DeleteManagedProjectButton } from './DeleteManagedProjectButton';
import { DetachManagedProjectButton } from './DetachManagedProjectButton';
import { AttachManagedProjectButton } from './AttachManagedProjectButton';


export const ManagedProjectActions = ({
    project,
    refetch,
    as,
}) => {
    if (!project) {
        return null;
    }

    return (
        <ActionsDropdown
            row={project}
            refetch={refetch}
            actions={[
                project.state === 'pending' ? ApproveManagedProjectButton : null,
                project.state === 'pending' ? RejectManagedProjectButton : null,
                AttachManagedProjectButton,
                project.project ? DetachManagedProjectButton : null,
                DeleteManagedProjectButton,
            ].filter(Boolean)}
            data-cy="public-resources-list-actions-dropdown-btn"
        />
    );
};
