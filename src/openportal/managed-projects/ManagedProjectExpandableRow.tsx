import { FC } from 'react';
import { ExpandableContainer } from '@waldur/table/ExpandableContainer';
import { formatDate, formatDateTime } from '@waldur/core/dateUtils';

import { ManagedProject } from '../types';

interface OwnProps {
    row: ManagedProject;
}

const renderProjectLink = (row: any) => {
    if (row.project_data) {
        const project = row.project_data;
        return <a href={`/projects/${project.uuid}/`}>{project.name || 'Unnamed Project'}</a>;
    }

    if (row.project) {
        const project = row.project;
        return project;
    }

    return 'No project assigned';
};

const renderProjectTemplateLink = (row: any) => {
    if (row.project_template_data) {
        const template = row.project_template_data;
        return template.name;
    }

    if (row.project_template) {
        const template = row.project_template;
        return template;
    }

    if (row.details?.template) {
        return row.details.template;
    }

    if (row.details?.class) {
        return row.details.class;
    }

    return 'No project template assigned';
};

export const ManagedProjectExpandableRow: FC<OwnProps> = (props) => {
    return (
        <ExpandableContainer>
            <div className="overflow-auto" unmountOnExit={true}>
                <div>
                    <strong>Project Name:</strong> {props.row.details.name || 'No name assigned.'}
                </div>
                <div>
                    <strong>Project:</strong> {renderProjectLink(props.row)}
                </div>
                <div>
                    <strong>Project Template:</strong> {renderProjectTemplateLink(props.row)}
                </div>
                <div>
                    <strong>Description:</strong> {props.row.details.description || 'No description provided.'}
                </div>
                <div>
                    <strong>Allocation:</strong> {props.row.details.allocation || 'No allocation provided.'}
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
                <div>
                    <strong>Reviewed by:</strong> {props.row.reviewed_by_full_name || 'No reviewer yet.'}
                </div>
                <div>
                    <strong>Comment:</strong> {props.row.review_comment || 'No comment provided.'}
                </div>
            </div>
        </ExpandableContainer>
    );
};
