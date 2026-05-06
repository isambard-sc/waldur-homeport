import { FC, useState } from 'react';
import { Button, Form } from 'react-bootstrap';
import { useMutation } from '@tanstack/react-query';
import { useDispatch } from 'react-redux';
import { ExpandableContainer } from '@waldur/table/ExpandableContainer';
import { formatDate, formatDateTime } from '@waldur/core/dateUtils';
import { ManagedProject } from 'waldur-js-client';
import { translate } from '@waldur/i18n/translate';
import { showErrorResponse, showSuccess } from '@waldur/store/notify';
import { LoadingSpinnerIcon } from '@waldur/core/LoadingSpinner';

import type { AwardDetails } from '../bindings/AwardDetails';
import type { Link } from '../bindings/Link';
import type { Note } from '../bindings/Note';
import { post } from '../api';

interface OwnProps {
    row: ManagedProject;
}

const renderProjectLink = (row: any) => {
    if (row.project_data) {
        const project = row.project_data;
        return <a href={`/projects/${project.uuid}/`}>{project.name || 'Unnamed Project'}</a>;
    }
    if (row.project) {
        return row.project;
    }
    return translate('No project assigned');
};

const renderProjectTemplateLink = (row: any) => {
    if (row.project_template_data) {
        return row.project_template_data.name;
    }
    if (row.project_template) {
        return row.project_template;
    }
    const details = row.details as AwardDetails;
    if (details?.template) {
        return details.template;
    }
    return translate('No project template assigned');
};

const renderOffering = (destination: string) => {
    if (destination) {
        const parts = destination.split('.');
        return parts[parts.length - 1];
    }
    return '-';
};

const stringify_role = (role: any, project_template: any) => {
    if (!role) {
        return translate('No role assigned');
    }
    if (!project_template || !project_template.role_mapping) {
        return translate('Will not be added to project');
    }
    let mapped_role = project_template.role_mapping[role];
    if (!mapped_role) {
        mapped_role = Object.entries(project_template.role_mapping).find(
            ([key]) => key.toLowerCase() === role.toLowerCase()
        )?.[1];
        if (!mapped_role) {
            return role + ' ' + translate('has no mapping - will not be added to project');
        }
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

const renderLink = (link: Link | null, fallback: string) => {
    if (!link) return fallback;
    const label = link.id || link.url;
    if (link.url && label) {
        return <a href={link.url} target="_blank" rel="noopener noreferrer">{label}</a>;
    }
    return label || fallback;
};

const renderAllowedDomains = (allowed_domains: Array<string> | null) => {
    if (allowed_domains === null) {
        return translate('All domains allowed');
    }
    if (allowed_domains.length === 0) {
        return translate('No domains allowed');
    }
    return allowed_domains.join(', ');
};

const NotesList: FC<{ notes: Note[]; identifier: string; destination: string }> = ({
    notes: initialNotes,
    identifier,
    destination,
}) => {
    const dispatch = useDispatch();
    const [notes, setNotes] = useState<Note[]>(initialNotes);
    const [text, setText] = useState('');

    const { mutate, isPending } = useMutation({
        mutationFn: async () => {
            await post(`/openportal-managed-projects/${identifier}/${destination}/add-note/`, { text });
        },
        onSuccess: () => {
            const newNote: Note = {
                text,
                author: translate('You'),
                timestamp: new Date().toISOString(),
            };
            setNotes((prev) => [...prev, newNote]);
            setText('');
            dispatch(showSuccess(translate('Note added.')));
        },
        onError: (error: Response) => {
            dispatch(showErrorResponse(error, translate('Unable to add note.')));
        },
    });

    return (
        <div>
            {notes.length === 0 ? (
                <div className="text-muted mb-2">{translate('No notes yet.')}</div>
            ) : (
                <div className="mb-2">
                    {notes.map((note, i) => (
                        <div key={i} className="border rounded p-2 mb-1 bg-light">
                            <div className="d-flex justify-content-between">
                                <strong>{note.author}</strong>
                                <small className="text-muted">{formatDateTime(note.timestamp)}</small>
                            </div>
                            <div>{note.text}</div>
                        </div>
                    ))}
                </div>
            )}
            <Form
                onSubmit={(e) => {
                    e.preventDefault();
                    if (text.trim()) mutate();
                }}
            >
                <Form.Control
                    as="textarea"
                    rows={2}
                    value={text}
                    onChange={(e) => setText(e.target.value)}
                    placeholder={translate('Add a note...')}
                    className="mb-1"
                    disabled={isPending}
                />
                <Button
                    type="submit"
                    size="sm"
                    variant="primary"
                    disabled={isPending || !text.trim()}
                >
                    {isPending ? <LoadingSpinnerIcon className="me-1" /> : null}
                    {translate('Add note')}
                </Button>
            </Form>
        </div>
    );
};

export const ManagedProjectExpandableRow: FC<OwnProps> = ({ row }) => {
    const details = row.details as AwardDetails;

    return (
        <ExpandableContainer>
            <div className="overflow-auto">
                <div><strong>{translate('Project name:')}</strong> {details.name || translate('No name assigned.')}</div>
                <div><strong>{translate('Project:')}</strong> {renderProjectLink(row)}</div>
                <div><strong>{translate('Offering:')}</strong> {renderOffering(row.destination)}</div>
                <div><strong>{translate('Project template:')}</strong> {renderProjectTemplateLink(row)}</div>
                <div><strong>{translate('Description:')}</strong> {details.description || translate('No description provided.')}</div>
                <div>
                    <strong>{translate('Members:')}</strong>{' '}
                    {stringify_members(details.members, row.project_template_data)}
                </div>
                <div><strong>{translate('Allocation:')}</strong> {details.allocation || translate('No allocation provided.')}</div>
                {details.breakdown && Object.keys(details.breakdown).length > 0 && (
                    <div>
                        <strong>{translate('Breakdown:')}</strong>
                        {Object.entries(details.breakdown).map(([k, v]) => (
                            <div key={k}>&nbsp;&nbsp;{k}: {v}</div>
                        ))}
                    </div>
                )}
                <div>
                    <strong>{translate('Start date:')}</strong>{' '}
                    {details.start_date ? formatDate(details.start_date) : translate('No start date provided.')}
                </div>
                <div>
                    <strong>{translate('End date:')}</strong>{' '}
                    {details.end_date ? formatDate(details.end_date) : translate('No end date provided.')}
                </div>
                {details.earliest_approve && (
                    <div>
                        <strong>{translate('Earliest approve:')}</strong> {formatDateTime(details.earliest_approve)}
                    </div>
                )}
                {details.membership_control && (
                    <div>
                        <strong>{translate('Membership control:')}</strong> {details.membership_control}
                    </div>
                )}
                <div>
                    <strong>{translate('Allowed domains:')}</strong> {renderAllowedDomains(details.allowed_domains)}
                </div>
                {details.award && (
                    <div>
                        <strong>{translate('Award:')}</strong> {renderLink(details.award, '-')}
                    </div>
                )}
                {details.call && (
                    <div>
                        <strong>{translate('Call:')}</strong> {renderLink(details.call, '-')}
                    </div>
                )}
                {details.project_link && (
                    <div>
                        <strong>{translate('Project link:')}</strong> {renderLink(details.project_link, '-')}
                    </div>
                )}
                {details.renewal && (
                    <div>
                        <strong>{translate('Renewal:')}</strong> {renderLink(details.renewal, '-')}
                    </div>
                )}
                <div>
                    <strong>{translate('Created:')}</strong>{' '}
                    {row.created ? formatDateTime(row.created) : translate('No creation date provided.')}
                </div>
                <div>
                    <strong>{translate('Remote identifier:')}</strong> {row.identifier || translate('No remote identifier provided.')}
                </div>
                <div>
                    <strong>{translate('Local identifier:')}</strong> {row.local_identifier || translate('No local identifier provided.')}
                </div>
                <div><strong>{translate('State:')}</strong> {row.state || translate('No state provided.')}</div>
                <div>
                    <strong>{translate('Reviewed by:')}</strong> {row.reviewed_by_full_name || translate('No reviewer yet.')}
                </div>
                <div>
                    <strong>{translate('Comment:')}</strong> {row.review_comment || translate('No comment provided.')}
                </div>
                <div className="mt-2">
                    <strong>{translate('Notes:')}</strong>
                    <div className="mt-1">
                        <NotesList
                            notes={details.notes || []}
                            identifier={row.identifier}
                            destination={row.destination}
                        />
                    </div>
                </div>
            </div>
        </ExpandableContainer>
    );
};
