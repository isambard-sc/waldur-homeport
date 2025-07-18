import React, { useState, useEffect } from 'react';
import { FunctionComponent } from 'react';
import { Card } from 'react-bootstrap';
import { FilterBox } from '@waldur/form/FilterBox';
import { Field } from '@waldur/resource/summary/Field';

import { useTitle } from '@waldur/navigation/title';
import { get } from '@waldur/core/api';
import { translate } from '@waldur/i18n';

export const AccessForEmail: FunctionComponent<{}> = () => {
    useTitle(translate('Check user access'), '', 'browser');

    const [email, setEmail] = useState('');
    const [data, setData] = useState(null);
    const [loading, setLoading] = useState(false);
    const [error, setError] = useState(null);

    const isValidEmail = (email) => {
        const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
        return emailRegex.test(email);
    };

    const handleSearch = async (e) => {
        if (e) e.preventDefault();
        if (!email.trim() || !isValidEmail(email)) return;

        setLoading(true);
        setError(null);

        try {
            const url = `/openportal/access_for_email/?email=${encodeURIComponent(email)}`;
            const response = await get(url);
            setData(response);
        } catch (err) {
            setError(err.message || 'Failed to fetch data');
        } finally {
            setLoading(false);
        }
    };

    useEffect(() => {
        if (email && isValidEmail(email)) {
            const timeoutId = setTimeout(() => {
                handleSearch(null);
            }, 500); // 500ms delay to avoid too many requests while typing

            return () => clearTimeout(timeoutId);
        }
    }, [email]);

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
                        <Card>
                            <Card.Header className="custom-card-header custom-padding-zero">
                                <Card.Title>
                                    {translate('User Information')}
                                </Card.Title>
                            </Card.Header>
                            <Card.Body className="custom-padding-zero">
                                <Field
                                    label={translate('Email')}
                                    value={data.email}
                                />
                                <Field
                                    label={translate('Status')}
                                    value={data.status}
                                />
                                {data.short_name && (<Field
                                    label={translate('Short Name')}
                                    value={data.short_name}
                                />)}
                                {data.invited_by && (<Field
                                    label={translate('Invited By')}
                                    value={data.invited_by}
                                />)}
                                {data.reason && (<Field
                                    label={translate('Reason')}
                                    value={data.reason}
                                />)}
                            </Card.Body>
                        </Card>
                    )
                }

                {
                    data && data.projects && typeof data.projects === 'object' && Object.keys(data.projects).length > 0 && (
                        <Card>
                            <Card.Header className="custom-card-header custom-padding-zero">
                                <Card.Title>
                                    {translate('Projects')}
                                </Card.Title>
                            </Card.Header>
                            <Card.Body className="custom-padding-zero">
                                {Object.entries(data.projects).map(([projectId, project]) => (
                                    <div key={projectId}>
                                        <div>
                                            <h3 className="text-lg font-medium text-gray-800">{project.name}</h3>
                                            <span className="text-sm text-gray-500 bg-gray-100 px-2 py-1 rounded">
                                                {projectId}
                                            </span>
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
                            </Card.Body>
                        </Card>
                    )
                }
            </Card.Body>
        </Card >
    );
};
