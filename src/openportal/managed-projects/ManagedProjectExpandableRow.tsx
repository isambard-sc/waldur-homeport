import { FC } from 'react';
import { ExpandableContainer } from '@waldur/table/ExpandableContainer';
import { formatDate, formatDateTime } from '@waldur/core/dateUtils';

import { ManagedProject } from '../types';
import { translate } from '@waldur/i18n/translate';

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

const stringify_role = (role: any, project_template: any) => {
    if (!role) {
        return translate('No role assigned');
    }
    if (!project_template || !project_template.role_mapping) {
        return translate('Will not be added to project');
    }

    console.log('Look up role:', role, 'in project template:', project_template);
    console.log(project_template);

    const mapped_role = project_template.role_mapping[role];

    if (!mapped_role) {
        return role + " " + translate(`has no mapping - will not be added to project`);
    }

    return mapped_role.description || mapped_role.name || mapped_role.uuid || translate('Not set');
};

const stringify_members = (members, project_template) => {
    if (!members || Object.keys(members).length === 0) {
        return translate('No members assigned');
    }

    return Object.entries(members).map(([key, value]) => (
        <div key={key}>
            &nbsp;&nbsp;{key} : {stringify_role(value, project_template)}
        </div>
    ));
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
                    <strong>Members:</strong> {stringify_members(props.row.details.members,
                        props.row.project_template_data
                    )}
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
