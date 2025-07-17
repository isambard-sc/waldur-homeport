import React, { useState } from 'react';
import { MagnifyingGlass, User, Envelope, Users, UserCheck } from '@phosphor-icons/react';

import { useTitle } from '@waldur/navigation/title';
import { get } from '@waldur/core/api';
import { translate } from '@waldur/i18n';

export const AccessForEmail = () => {
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
        <div className="max-w-4xl mx-auto p-6">
            <div className="bg-white rounded-lg shadow-lg">
                <div className="p-6 border-b">
                    <h1 className="text-2xl font-bold text-gray-800 mb-4">Access Information</h1>

                    {/* Search Form */}
                    <div className="flex gap-2">
                        <div className="flex-1 relative">
                            <Envelope className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-5 h-5" />
                            <input
                                type="email"
                                value={email}
                                onChange={(e) => setEmail(e.target.value)}
                                placeholder={translate('Enter email address')}
                                className="w-full pl-10 pr-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                                onKeyDown={(e) => e.key === 'Enter' && handleSearch(e)}
                            />
                        </div>
                        <button
                            onClick={handleSearch}
                            disabled={loading}
                            className="px-6 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 disabled:opacity-50 disabled:cursor-not-allowed flex items-center gap-2"
                        >
                            <MagnifyingGlass className="w-4 h-4" />
                            {loading ? translate('Searching...') : translate('Search')}
                        </button>
                    </div>
                </div>

                {/* Error Display */}
                {error && (
                    <div className="p-4 bg-red-50 border-l-4 border-red-400">
                        <div className="flex">
                            <div className="ml-3">
                                <p className="text-sm text-red-700">{error}</p>
                            </div>
                        </div>
                    </div>
                )}

                {/* Results Display */}
                {data && (
                    <div className="p-6">
                        {/* User Info Section */}
                        <div className="mb-6">
                            <div className="flex items-center gap-2 mb-4">
                                <User className="w-5 h-5 text-blue-600" />
                                <h2 className="text-xl font-semibold text-gray-800">User Information</h2>
                            </div>

                            <div className="grid grid-cols-1 md:grid-cols-2 gap-4 bg-gray-50 p-4 rounded-lg">
                                <div className="flex items-center gap-2">
                                    <Envelope className="w-4 h-4 text-gray-500" />
                                    <span className="text-sm text-gray-600">{translate('Email')}:</span>
                                    <span className="text-sm font-medium">{data.email}</span>
                                </div>

                                <div className="flex items-center gap-2">
                                    <span className="text-sm text-gray-600">{translate('Status')}:</span>
                                    <span className={`text-sm font-medium px-2 py-1 rounded ${data.status === 'active'
                                        ? 'bg-green-100 text-green-800'
                                        : 'bg-red-100 text-red-800'
                                        }`}>
                                        {data.status}
                                    </span>
                                </div>

                                <div className="flex items-center gap-2">
                                    <UserCheck className="w-4 h-4 text-gray-500" />
                                    <span className="text-sm text-gray-600">{translate('Short Name')}:</span>
                                    <span className="text-sm font-medium">{data.short_name}</span>
                                </div>

                                {data.invited_by && (
                                    <div className="flex items-center gap-2">
                                        <Users className="w-4 h-4 text-gray-500" />
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

                        {/* Projects Section */}
                        {data.projects && Object.keys(data.projects).length > 0 && (
                            <div>
                                <div className="flex items-center gap-2 mb-4">
                                    <h2 className="text-xl font-semibold text-gray-800">{translate('Projects')}</h2>
                                </div>

                                <div className="space-y-4">
                                    {Object.entries(data.projects).map(([projectId, project]) => (
                                        <div key={projectId} className="border border-gray-200 rounded-lg p-4">
                                            <div className="flex items-center justify-between mb-3">
                                                <h3 className="text-lg font-medium text-gray-800">{project.name}</h3>
                                                <span className="text-sm text-gray-500 bg-gray-100 px-2 py-1 rounded">
                                                    {projectId}
                                                </span>
                                            </div>

                                            {project.resources && project.resources.length > 0 && (
                                                <div>
                                                    <h4 className="text-sm font-medium text-gray-700 mb-2">Resources:</h4>
                                                    <div className="space-y-2">
                                                        {project.resources.map((resource, index) => (
                                                            <div key={index} className="bg-gray-50 p-3 rounded">
                                                                <div className="flex items-center justify-between">
                                                                    <span className="text-sm font-medium text-gray-800">
                                                                        {resource.name}
                                                                    </span>
                                                                    <span className="text-sm text-gray-600">
                                                                        {translate('Username')}: <span className="font-mono bg-gray-200 px-2 py-1 rounded">
                                                                            {resource.username}
                                                                        </span>
                                                                    </span>
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
                )}
            </div>
        </div>
    );
};
