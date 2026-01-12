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
            <Card.Header className="custom-card-header custom-padding-zero">
                <Card.Title>
                    {translate('User Information')}
                    {index !== null && ` - User ${index + 1}`}
                </Card.Title>
            </Card.Header>
            <Card.Body className="custom-padding-zero">
                <Field
                    label={translate('Email')}
                    value={userData.email}
                />
                <Field
                    label={translate('Status')}
                    value={userData.status}
                />
                {userData.short_name && (
                    <Field
                        label={translate('Short Name')}
                        value={userData.short_name}
                    />
                )}
                {userData.invited_by && (
                    <Field
                        label={translate('Invited By')}
                        value={userData.invited_by}
                    />
                )}
                {userData.reason && (
                    <Field
                        label={translate('Reason')}
                        value={userData.reason}
                    />
                )}
            </Card.Body>
        </Card>
    );
};

// Reusable component to display projects
const ProjectsCard: FunctionComponent<ProjectsCardProps> = ({ projects }) => {
    if (!projects || typeof projects !== 'object' || Object.keys(projects).length === 0) {
        return (
            <div className="p-4 text-center text-gray-500">
                {translate('No projects found for this user')}
            </div>
        );
    }

    return (
        <Card>
            <Card.Header className="custom-card-header custom-padding-zero">
                <Card.Title>
                    {translate('Projects')} ({Object.keys(projects).length})
                </Card.Title>
            </Card.Header>
            <Card.Body className="custom-padding-zero">
                {Object.entries(projects).map(([projectId, project]) => (
                    <div key={projectId} className="mb-4 pb-4 border-bottom">
                        <div className="mb-3">
                            <h3 className="text-lg font-medium text-gray-800 mb-1">
                                {project.name}
                            </h3>
                            <span className="text-sm text-gray-500 bg-gray-100 px-2 py-1 rounded">
                                {projectId}
                            </span>
                        </div>

                        {project.resources && Array.isArray(project.resources) && project.resources.length > 0 && (
                            <div>
                                <h4 className="text-sm font-medium text-gray-700 mb-2">
                                    {translate('Resources')} ({project.resources.length}):
                                </h4>
                                <div className="space-y-2">
                                    {project.resources.map((resource, index) => (
                                        <div key={index} className="p-3 bg-gray-50 rounded">
                                            <div className="flex items-center justify-between flex-wrap">
                                                <span className="text-sm font-medium text-gray-800">
                                                    {resource.name}
                                                </span>
                                                <div className="text-sm text-gray-600">
                                                    {translate('Username')}:{' '}
                                                    <span className="font-mono bg-gray-200 px-2 py-1 rounded">
                                                        {resource.username}
                                                    </span>
                                                </div>
                                            </div>
                                        </div>
                                    ))}
                                </div>
                            </div>
                        )}
                    </div>
                ))}
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
            <Card.Header className="custom-card-header custom-padding-zero">
                <Card.Title>
                    {translate('Check user access')}
                </Card.Title>
            </Card.Header>
            <Card.Body className="custom-padding-zero">
                <div className="mb-3 px-4 pt-4">
                    <p className="text-muted mb-3">
                        {translate('Search by email, short name, project name, or project ID')}
                    </p>
                </div>

                <div className="px-4 pb-3">
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
                                className="btn btn-outline-secondary"
                                onClick={handleClear}
                            >
                                {translate('Clear')}
                            </button>
                        )}
                    </div>
                </div>

                {loading && (
                    <div className="p-4 text-center">
                        <div className="spinner-border" role="status">
                            <span className="visually-hidden">{translate('Loading...')}</span>
                        </div>
                    </div>
                )}

                {error && (
                    <div className="p-4 bg-red-50 border-l-4 border-red-400">
                        <div className="flex">
                            <div className="ml-3">
                                <p className="text-sm text-red-700">{error}</p>
                            </div>
                        </div>
                    </div>
                )}

                {data && Array.isArray(data) && data.length > 0 && (
                    <>
                        {data.length > 1 && (
                            <div className="px-4 pt-4">
                                <div className="alert alert-info">
                                    {translate('Found')} {data.length} {translate('users')}
                                </div>
                            </div>
                        )}

                        {data.map((userData, index) => (
                            <div key={index} className="mb-3">
                                <UserInfoCard 
                                    userData={userData} 
                                    index={data.length > 1 ? index : null}
                                />
                                <ProjectsCard projects={userData.projects} />
                            </div>
                        ))}
                    </>
                )}

                {data && Array.isArray(data) && data.length === 0 && (
                    <div className="p-4 text-center text-gray-500">
                        {translate('No results found')}
                    </div>
                )}
            </Card.Body>
        </Card>
    );
};
