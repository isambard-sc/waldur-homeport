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

    console.log('Mappings state:', mappings);
    console.log('initialized state:', initialized);

    // Initialize mappings from value only once
    useEffect(() => {
        if (!initialized) {
            if (value && Object.keys(value).length > 0) {
                const initialMappings = Object.entries(value).map(([key, val], index) => ({
                    key,
                    value: val,
                    id: `mapping-${index}`
                }));
                setMappings(initialMappings);
            }
            // Don't start with empty mapping - let user add if needed
            setInitialized(true);
        }
    }, [value, initialized]);

    // Convert mappings array back to dictionary and call onChange
    const updateValue = (newMappings: Array<{ key: string; value: any; id: string }>) => {
        console.log('updateValue called with:', newMappings);
        setMappings(newMappings);

        // Filter out mappings with empty keys or null values
        // const validMappings = newMappings.filter(m => m.key.trim() !== '' && m.value !== null);
        const validMappings = newMappings;

        // Convert to dictionary
        /*const dictionary = validMappings.reduce((acc, mapping) => {
            acc[mapping.key] = mapping.value;
            return acc;
        }, {} as Record<string, any>);*/

        // console.log('calling onChange with dictionary:', dictionary);
        // onChange(dictionary);
    };

    const addMapping = () => {
        console.log('Adding new mapping');
        const newMapping = {
            key: '',
            value: null,
            id: `mapping-${mappings.length}`
        };
        const newMappings = [...mappings, newMapping];
        console.log('New mappings after addition:', newMappings);
        updateValue(newMappings);
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
                <div key={`rolemapper-${mapping.id}`} className="row mb-3 align-items-end">
                    <div className="col-md-5">
                        <label className="form-label small">
                            {translate('Remote Role Name')}
                        </label>
                        <input
                            key={`input-${mapping.id}`}
                            type="text"
                            className="form-control"
                            placeholder={translate('e.g., admin, user, viewer')}
                            value={mapping.key}
                            onChange={(e) => updateMappingKey(mapping.id, e.target.value)}
                            onBlur={onBlur}
                        />
                    </div>

                    <div key={`arrow-${mapping.id}`} className="col-md-1 text-center">
                        <span className="text-muted">→</span>
                    </div>

                    <div className="col-md-5">
                        <label className="form-label small">
                            {translate('Local Role')}
                        </label>
                        <AsyncPaginate
                            key={`select-${mapping.id}`}
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
                            key={`remove-${mapping.id}`}
                            type="button"
                            className="btn btn-outline-danger btn-sm"
                            onClick={(e) => {
                                e.preventDefault();
                                e.stopPropagation();
                                removeMapping(mapping.id);
                            }}
                            title={translate('Remove mapping')}
                        >
                            {translate('Remove')}
                        </button>
                    </div>
                </div>
            ))}

            <div className="mt-3">
                <button
                    key="add-mapping-button"
                    type="button"
                    className="btn btn-outline-primary btn-sm"
                    onClick={(e) => {
                        e.preventDefault();
                        e.stopPropagation();
                        addMapping();
                    }}
                >
                    {translate('Add Role Mapping')}
                </button>
            </div>
        </div>
    );
};