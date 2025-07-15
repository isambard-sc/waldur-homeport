import React, { useState, useEffect, FunctionComponent } from 'react';
import { Field } from 'react-final-form';

import { rolesList } from 'waldur-js-client';
import { ENV } from '@waldur/core/config';
import { parseSelectData } from '@waldur/core/api';
import { translate } from '@waldur/i18n';
import { AsyncPaginate } from '@waldur/form/themed-select';
import { returnReactSelectAsyncPaginateObject } from '@waldur/core/utils';


const roleAutocomplete = async (query: string, prevOptions, { page }) => {
    const response = await rolesList({
        query: {
            name: query,
            page: page,
            page_size: ENV.pageSize,
            field: ['uuid', 'name', 'description'],
        },
    });
    return returnReactSelectAsyncPaginateObject(
        parseSelectData(response),
        prevOptions,
        page,
    );
};

export const RoleMappingField: FunctionComponent<{
    name: string;
    placeholder?: string;
    validator?: any;
}> = (props) => (
    <Field
        name={props.name}
        validate={props.validator}
        component={({ input, meta }) => (
            <RoleMappingComponent
                value={input.value}
                onChange={input.onChange}
                onBlur={input.onBlur}
                placeholder={props.placeholder}
            />
        )}
    />
);

const RoleMappingComponent: FunctionComponent<{
    value?: Record<string, any>;
    onChange: (value: Record<string, any>) => void;
    onBlur: () => void;
    placeholder?: string;
}> = ({ value = {}, onChange, onBlur, placeholder }) => {
    // Convert dictionary to array for easier manipulation
    const [mappings, setMappings] = useState<Array<{ key: string; value: any; id: string }>>([]);
    const [initialized, setInitialized] = useState(false);

    // Initialize mappings from value only once
    useEffect(() => {
        if (!initialized) {
            if (value && Object.keys(value).length > 0) {
                const initialMappings = Object.entries(value).map(([key, val], index) => ({
                    key,
                    value: val,
                    id: `mapping-${index}-${Date.now()}`
                }));
                setMappings(initialMappings);
            }
            // Don't start with empty mapping - let user add if needed
            setInitialized(true);
        }
    }, [value, initialized]);

    // Convert mappings array back to dictionary and call onChange
    const updateValue = (newMappings: Array<{ key: string; value: any; id: string }>) => {
        setMappings(newMappings);

        // Filter out mappings with empty keys or null values
        const validMappings = newMappings.filter(m => m.key.trim() !== '' && m.value !== null);

        // Convert to dictionary
        const dictionary = validMappings.reduce((acc, mapping) => {
            acc[mapping.key] = mapping.value;
            return acc;
        }, {} as Record<string, any>);

        onChange(dictionary);
    };

    const addMapping = () => {
        const newMapping = {
            key: '',
            value: null,
            id: `mapping-${mappings.length}-${Date.now()}`
        };
        updateValue([...mappings, newMapping]);
    };

    const removeMapping = (idToRemove: string) => {
        const newMappings = mappings.filter(m => m.id !== idToRemove);
        updateValue(newMappings);
    };

    const updateMappingKey = (id: string, newKey: string) => {
        const newMappings = mappings.map(m =>
            m.id === id ? { ...m, key: newKey } : m
        );
        updateValue(newMappings);
    };

    const updateMappingValue = (id: string, newValue: any) => {
        const newMappings = mappings.map(m =>
            m.id === id ? { ...m, value: newValue } : m
        );
        updateValue(newMappings);
    };

    return (
        <div className="role-mapping-container">
            <div className="mb-2">
                <small className="text-muted">
                    {translate('Map remote portal role names to local roles')}
                </small>
            </div>

            {mappings.length === 0 && (
                <div className="text-muted mb-3">
                    {translate('No role mappings configured. Click "Add Role Mapping" to create mappings.')}
                </div>
            )}

            {mappings.map((mapping, index) => (
                <div key={mapping.id} className="row mb-3 align-items-end">
                    <div className="col-md-5">
                        <label className="form-label small">
                            {translate('Remote Role Name')}
                        </label>
                        <input
                            type="text"
                            className="form-control"
                            placeholder={translate('e.g., admin, user, viewer')}
                            value={mapping.key}
                            onChange={(e) => updateMappingKey(mapping.id, e.target.value)}
                            onBlur={onBlur}
                        />
                    </div>

                    <div className="col-md-1 text-center">
                        <span className="text-muted">→</span>
                    </div>

                    <div className="col-md-5">
                        <label className="form-label small">
                            {translate('Local Role')}
                        </label>
                        <AsyncPaginate
                            placeholder={translate('Select local role...')}
                            loadOptions={roleAutocomplete}
                            defaultOptions
                            getOptionValue={(option) => option.uuid}
                            getOptionLabel={(option) => option.description || option.name}
                            value={mapping.value}
                            onChange={(value) => updateMappingValue(mapping.id, value)}
                            onBlur={onBlur}
                            noOptionsMessage={() => translate('No roles found')}
                            isClearable={true}
                            className="metronic-select-container"
                            classNamePrefix="metronic-select"
                        />
                    </div>

                    <div className="col-md-1">
                        <button
                            type="button"
                            className="btn btn-outline-danger btn-sm"
                            onClick={() => removeMapping(mapping.id)}
                            title={translate('Remove mapping')}
                        >
                            <i className="fa fa-trash" />
                        </button>
                    </div>
                </div>
            ))}

            <div className="mt-3">
                <button
                    type="button"
                    className="btn btn-outline-primary btn-sm"
                    onClick={addMapping}
                >
                    <i className="fa fa-plus me-1" />
                    {translate('Add Role Mapping')}
                </button>
            </div>

            {mappings.length > 0 && (
                <div className="mt-3">
                    <small className="text-muted">
                        {translate('Preview')}: {JSON.stringify(
                            mappings
                                .filter(m => m.key.trim() !== '' && m.value !== null)
                                .reduce((acc, m) => {
                                    acc[m.key] = m.value?.name || m.value?.description || 'Selected Role';
                                    return acc;
                                }, {} as Record<string, string>)
                        )}
                    </small>
                </div>
            )}
        </div>
    );
};