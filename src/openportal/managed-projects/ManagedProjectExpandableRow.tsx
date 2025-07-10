import { FC } from 'react';
import { ExpandableContainer } from '@waldur/table/ExpandableContainer';

import { ManagedProject } from './ManagedProject';

interface OwnProps {
    row: ManagedProject;
}

export const ManagedProjectExpandableRow: FC<OwnProps> = (props) => {
    return (
        <ExpandableContainer>
            <div className="overflow-auto" unmountOnExit={true}>
                Something something something...
                <div>
                    {props.row.details.description || 'No description provided.'}
                </div>
            </div>
        </ExpandableContainer>
    );
};
