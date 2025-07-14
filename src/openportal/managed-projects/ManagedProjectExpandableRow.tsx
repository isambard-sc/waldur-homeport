import { FC } from 'react';
import { ExpandableContainer } from '@waldur/table/ExpandableContainer';
import { formatDate, formatDateTime } from '@waldur/core/dateUtils';

import { ManagedProject } from '../types';

interface OwnProps {
    row: ManagedProject;
}

export const ManagedProjectExpandableRow: FC<OwnProps> = (props) => {
    return (
        <ExpandableContainer>
            <div className="overflow-auto" unmountOnExit={true}>
                <div>
                    <strong>Project Name:</strong> {props.row.details.name || 'No name assigned.'}
                </div>
                <div>
                    <strong>Project Class:</strong> {props.row.details.class || 'No class assigned.'}
                </div>
                <div>
                    <strong>Description:</strong> {props.row.details.description || 'No description provided.'}
                </div>
                <div>
                    <strong>Credits:</strong> {props.row.details.credits || 'No credits provided.'}
                </div>
                <div>
                    <strong>Start date:</strong> {
                        props.row.details.start_date
                            ? formatDate(props.row.details.start_date)
                            : 'No start date provided.'
                    }
                </div>
                <div>
                    <strong>End date:</strong> {
                        props.row.details.end_date
                            ? formatDate(props.row.details.end_date)
                            : 'No end date provided.'
                    }
                </div>
                <div>
                    <strong>Created:</strong> {props.row.created ? formatDateTime(props.row.created)
                        : 'No creation date provided.'}
                </div>
                <div>
                    <strong>Remote identifier:</strong> {props.row.identifier || 'No remote identifier provided.'}
                </div>
                <div>
                    <strong>Local identifier:</strong> {props.row.local_identifier || 'No local identifier provided.'}
                </div>
                <div>
                    <strong>State:</strong> {props.row.state || 'No state provided.'}
                </div>
            </div>
        </ExpandableContainer>
    );
};
