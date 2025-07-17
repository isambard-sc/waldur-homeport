import React, { useState } from 'react';
import { FunctionComponent } from 'react';
import { Card } from 'react-bootstrap';
import { FilterBox } from '@waldur/form/FilterBox';

import { useTitle } from '@waldur/navigation/title';
import { get } from '@waldur/core/api';
import { translate } from '@waldur/i18n';

export const AccessForEmail: FunctionComponent<{}> = () => {
    useTitle(translate('Check user access'), '', 'browser');

    const [email, setEmail] = useState('');
    const [data, setData] = useState(null);
    const [loading, setLoading] = useState(false);
    const [error, setError] = useState(null);

    const handleSearch = async (e) => {
        e.preventDefault();
        if (!email.trim()) return;

        setLoading(true);
        setError(null);

        console.log(`Searching for access for email: ${email}`);

        try {
            const url = `/openportal/access_for_email/?email=${encodeURIComponent(email)}`;
            const response = await get(url);
            setData(response);
        } catch (err) {
            setError(err.message || translate('Failed to fetch data'));
        } finally {
            setLoading(false);
        }
    };

    return (
        <Card className="card-bordered">
            <Card.Header className="custom-card-header custom-padding-zero">
                <Card.Title>
                    {translate('Check user access')}
                </Card.Title>
            </Card.Header>
            <Card.Body className="custom-padding-zero">
                <FilterBox
                    type="search"
                    placeholder={translate('Enter email address')}
                    onChange={(e) => setEmail(e.target.value)}
                    onKeyDown={(e) => e.key === 'Enter' && handleSearch(e)}
                />

                {
                    error && (
                        <div className="p-4 bg-red-50 border-l-4 border-red-400">
                            <div className="flex">
                                <div className="ml-3">
                                    <p className="text-sm text-red-700">{error}</p>
                                </div>
                            </div>
                        </div>
                    )
                }

                {
                    data && (
                        <div className="p-6">
                            <div className="mb-6">
                                <div className="flex items-center gap-2 mb-4">
                                    <h2 className="text-xl font-semibold text-gray-800">User Information</h2>
                                </div>

                                <div className="grid grid-cols-1 md:grid-cols-2 gap-4 bg-gray-50 p-4 rounded-lg">
                                    <div>
                                        <span className="text-sm text-gray-600">{translate('Email')}:</span>
                                        <span className="text-sm font-medium">{data.email}</span>
                                    </div>

                                    <div>
                                        <span className="text-sm text-gray-600">{translate('Status')}:</span>
                                        <span className={`text-sm font-medium px-2 py-1 rounded ${data.status === 'active'
                                            ? 'bg-green-100 text-green-800'
                                            : 'bg-red-100 text-red-800'
                                            }`}>
                                            {data.status}
                                        </span>
                                    </div>

                                    <div>
                                        <span className="text-sm text-gray-600">{translate('Short Name')}:</span>
                                        <span className="text-sm font-medium">{data.short_name}</span>
                                    </div>

                                    {data.invited_by && (
                                        <div>
                                            <span className="text-sm text-gray-600">{translate('Invited By')}:</span>
                                            <span className="text-sm font-medium">{data.invited_by}</span>
                                        </div>
                                    )}
                                </div>

                                {data.reason && (
                                    <div className="mt-4 p-3 bg-blue-50 rounded-lg">
                                        <p className="text-sm text-gray-700">
                                            <span className="font-medium">{translate('Reason')}:</span> {data.reason}
                                        </p>
                                    </div>
                                )}
                            </div>

                            {data.projects && typeof data.projects === 'object' && Object.keys(data.projects).length > 0 && (
                                <div>
                                    <div className="flex items-center gap-2 mb-4">
                                        <h2 className="text-xl font-semibold text-gray-800">{translate('Projects')}</h2>
                                    </div>

                                    <div className="space-y-4">
                                        {Object.entries(data.projects).map(([projectId, project]) => (
                                            <div key={projectId} className="border border-gray-200 rounded-lg p-4">
                                                <div>
                                                    <h3 className="text-lg font-medium text-gray-800">{project.name}</h3>
                                                    <div className="text-sm text-gray-500 bg-gray-100 px-2 py-1 rounded">
                                                        {projectId}
                                                    </div>
                                                </div>

                                                {project.resources && Array.isArray(project.resources) && project.resources.length > 0 && (
                                                    <div>
                                                        <h4 className="text-sm font-medium text-gray-700 mb-2">Resources:</h4>
                                                        <div className="space-y-2">
                                                            {project.resources.map((resource, index) => (
                                                                <div key={index}>
                                                                    <div className="flex items-center justify-between">
                                                                        <span className="text-sm font-medium text-gray-800">
                                                                            {resource.name}
                                                                        </span>
                                                                        <div className="text-sm text-gray-600">
                                                                            {translate('Username')}: <span className="font-mono bg-gray-200 px-2 py-1 rounded">
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
                                    </div>
                                </div>
                            )}
                        </div>
                    )
                }
            </Card.Body>
        </Card>
    );
};
