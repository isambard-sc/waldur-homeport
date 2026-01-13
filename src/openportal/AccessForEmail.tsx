import React, { useState, useEffect } from 'react';
import { FunctionComponent } from 'react';
import { Card } from 'react-bootstrap';
import { FilterBox } from '@waldur/form/FilterBox';
import { Field } from '@waldur/resource/summary/Field';
import { useTitle } from '@waldur/navigation/title';
import { get } from '@waldur/core/api';
import { translate } from '@waldur/i18n';

// Type definitions
interface Resource {
    name: string;
    username: string;
}

interface Project {
    name: string;
    resources: Resource[];
}

interface UserData {
    email: string;
    status: string;
    short_name?: string;
    invited_by?: string;
    reason?: string;
    projects: Record<string, Project>;
}

interface UserInfoCardProps {
    userData: UserData;
    index?: number | null;
}

interface ProjectsCardProps {
    projects: Record<string, Project>;
}

// Reusable component to display user information
const UserInfoCard: FunctionComponent<UserInfoCardProps> = ({ userData, index = null }) => {
    return (
        <Card className="mb-3">
            <Card.Header>
                <Card.Title className="mb-0">
                    {translate('User Information')}
                    {index !== null && ` - ${translate('User')} ${index + 1}`}
                </Card.Title>
            </Card.Header>
            <Card.Body>
                <div className="fs-6">
                    <Field
                        label={translate('Email')}
                        value={userData.email}
                        space={2}
                        labelCol={4}
                        valueCol={8}
                        valueClass="text-break"
                    />
                    <Field
                        label={translate('Status')}
                        value={
                            <span className={`badge ${
                                userData.status === 'active' 
                                    ? 'badge-success' 
                                    : userData.status === 'invited'
                                    ? 'badge-warning'
                                    : 'badge-secondary'
                            }`}>
                                {userData.status}
                            </span>
                        }
                        space={2}
                        labelCol={4}
                        valueCol={8}
                    />
                    {userData.short_name && (
                        <Field
                            label={translate('Short Name')}
                            value={<code className="text-primary">{userData.short_name}</code>}
                            space={2}
                            labelCol={4}
                            valueCol={8}
                        />
                    )}
                    {userData.invited_by && (
                        <Field
                            label={translate('Invited By')}
                            value={userData.invited_by}
                            space={2}
                            labelCol={4}
                            valueCol={8}
                            valueClass="text-break"
                        />
                    )}
                    {userData.reason && (
                        <Field
                            label={translate('Reason')}
                            value={
                                <span className="text-danger">
                                    {userData.reason}
                                </span>
                            }
                            space={2}
                            labelCol={4}
                            valueCol={8}
                        />
                    )}
                </div>
            </Card.Body>
        </Card>
    );
};

// Reusable component to display projects
const ProjectsCard: FunctionComponent<ProjectsCardProps> = ({ projects }) => {
    if (!projects || typeof projects !== 'object' || Object.keys(projects).length === 0) {
        return (
            <Card>
                <Card.Body>
                    <div className="text-center text-muted py-4">
                        {translate('No projects found for this user')}
                    </div>
                </Card.Body>
            </Card>
        );
    }

    return (
        <Card>
            <Card.Header>
                <Card.Title className="mb-0">
                    {translate('Projects')} ({Object.keys(projects).length})
                </Card.Title>
            </Card.Header>
            <Card.Body>
                <div className="d-flex flex-column gap-4">
                    {Object.entries(projects).map(([projectId, project]) => (
                        <div key={projectId} className="border rounded p-3">
                            <div className="mb-3">
                                <h5 className="mb-1 fw-bold">
                                    {project.name}
                                </h5>
                                <div>
                                    <span className="badge badge-light-primary">
                                        {projectId}
                                    </span>
                                </div>
                            </div>

                            {project.resources && Array.isArray(project.resources) && project.resources.length > 0 && (
                                <div>
                                    <h6 className="mb-2 text-muted fw-semibold">
                                        {translate('Resources')} ({project.resources.length})
                                    </h6>
                                    <div className="d-flex flex-column gap-2">
                                        {project.resources.map((resource, index) => (
                                            <div key={index} className="bg-light rounded p-3">
                                                <div className="d-flex justify-content-between align-items-start flex-wrap gap-2">
                                                    <div className="flex-grow-1">
                                                        <div className="fw-semibold text-dark">
                                                            {resource.name}
                                                        </div>
                                                    </div>
                                                    <div className="text-end">
                                                        <small className="text-muted d-block">
                                                            {translate('Username')}
                                                        </small>
                                                        <code className="bg-secondary bg-opacity-25 px-2 py-1 rounded">
                                                            {resource.username}
                                                        </code>
                                                    </div>
                                                </div>
                                            </div>
                                        ))}
                                    </div>
                                </div>
                            )}
                            
                            {(!project.resources || project.resources.length === 0) && (
                                <div className="text-muted fst-italic">
                                    {translate('No resources in this project')}
                                </div>
                            )}
                        </div>
                    ))}
                </div>
            </Card.Body>
        </Card>
    );
};

export const AccessForEmail: FunctionComponent<{}> = () => {
    useTitle(translate('Check user access'), '', 'browser');

    const [searchValue, setSearchValue] = useState<string>('');
    const [data, setData] = useState<UserData[] | null>(null);
    const [loading, setLoading] = useState<boolean>(false);
    const [error, setError] = useState<string | null>(null);

    const handleSearch = async (e: React.FormEvent | null) => {
        if (e) e.preventDefault();
        if (!searchValue.trim()) return;

        setLoading(true);
        setError(null);

        try {
            // Use 'q' parameter for free text search
            const url = `/openportal/access_for_email/?q=${encodeURIComponent(searchValue)}`;
            const response = await get(url);
            
            // Normalize response to always be an array of users
            if (Array.isArray(response)) {
                setData(response);
            } else {
                // Single user response - wrap in array
                setData([response]);
            }
        } catch (err: any) {
            setError(err.message || 'Failed to fetch data');
            setData(null);
        } finally {
            setLoading(false);
        }
    };

    useEffect(() => {
        if (searchValue.trim()) {
            const timeoutId = setTimeout(() => {
                handleSearch(null);
            }, 500);

            return () => clearTimeout(timeoutId);
        } else {
            setData(null);
        }
    }, [searchValue]);

    const handleClear = () => {
        setSearchValue('');
        setData(null);
        setError(null);
    };

    return (
        <Card className="card-bordered">
            <Card.Header>
                <Card.Title className="mb-0">
                    {translate('Check user access')}
                </Card.Title>
            </Card.Header>
            <Card.Body>
                <div className="mb-3">
                    <p className="text-muted mb-3">
                        {translate('Search by email, short name, project name, or project ID')}
                    </p>
                </div>

                <div className="mb-3">
                    <div className="d-flex gap-2">
                        <FilterBox
                            type="search"
                            placeholder={translate('Enter email, short name, project name, or project ID...')}
                            value={searchValue}
                            onChange={(e) => setSearchValue(e.target.value)}
                            onKeyDown={(e) => e.key === 'Enter' && handleSearch(e)}
                            style={{ flex: 1 }}
                        />
                        {searchValue && (
                            <button 
                                type="button"
                                className="btn btn-secondary"
                                onClick={handleClear}
                            >
                                {translate('Clear')}
                            </button>
                        )}
                    </div>
                </div>

                {loading && (
                    <div className="text-center py-4">
                        <div className="spinner-border text-primary" role="status">
                            <span className="visually-hidden">{translate('Loading...')}</span>
                        </div>
                    </div>
                )}

                {error && (
                    <div className="alert alert-danger d-flex align-items-center" role="alert">
                        <i className="bi bi-exclamation-triangle-fill me-2"></i>
                        <div>{error}</div>
                    </div>
                )}

                {data && Array.isArray(data) && data.length > 0 && (
                    <>
                        {data.length > 1 && (
                            <div className="mb-3">
                                <div className="alert alert-info d-flex align-items-center">
                                    <i className="bi bi-info-circle-fill me-2"></i>
                                    <div>
                                        {translate('Found')} <strong>{data.length}</strong> {translate('users')}
                                    </div>
                                </div>
                            </div>
                        )}

                        <div className="d-flex flex-column gap-3">
                            {data.map((userData, index) => (
                                <div key={index}>
                                    <UserInfoCard 
                                        userData={userData} 
                                        index={data.length > 1 ? index : null}
                                    />
                                    <ProjectsCard projects={userData.projects} />
                                </div>
                            ))}
                        </div>
                    </>
                )}

                {data && Array.isArray(data) && data.length === 0 && (
                    <div className="alert alert-warning text-center">
                        <i className="bi bi-search me-2"></i>
                        {translate('No results found')}
                    </div>
                )}
            </Card.Body>
        </Card>
    );
};
