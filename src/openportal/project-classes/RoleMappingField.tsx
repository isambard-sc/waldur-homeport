import React, { useState, useEffect, FunctionComponent, useRef } from 'react';
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
    // Stored mappings (read-only display)
    const [mappings, setMappings] = useState<Array<{ key: string; value: any; id: string }>>([]);
    const [initialized, setInitialized] = useState(false);

    // Input form state (editable)
    const [inputKey, setInputKey] = useState('');
    const [inputValue, setInputValue] = useState(null);

    const idCounterRef = useRef(0);

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
                idCounterRef.current = initialMappings.length;
            }
            setInitialized(true);
        }
    }, [value, initialized]);

    // Convert mappings array back to dictionary and call onChange
    const updateValue = (newMappings: Array<{ key: string; value: any; id: string }>) => {
        console.log('updateValue called with:', newMappings);
        setMappings(newMappings);

        // Convert to dictionary
        const dictionary = newMappings.reduce((acc, mapping) => {
            acc[mapping.key] = mapping.value;
            return acc;
        }, {} as Record<string, any>);

        console.log('calling onChange with dictionary:', dictionary);
        onChange(dictionary);
    };

    const addMapping = () => {
        console.log('Adding new mapping');

        // Validate input
        if (!inputKey.trim() || !inputValue) {
            return;
        }

        // Check if key already exists
        if (mappings.some(m => m.key === inputKey.trim())) {
            alert(translate('A mapping with this remote role name already exists'));
            return;
        }

        const newMapping = {
            key: inputKey.trim(),
            value: inputValue,
            id: `mapping-${++idCounterRef.current}`
        };

        const newMappings = [...mappings, newMapping];
        console.log('New mappings after addition:', newMappings);
        updateValue(newMappings);

        // Clear input form
        setInputKey('');
        setInputValue(null);
    };

    const removeMapping = (idToRemove: string) => {
        const newMappings = mappings.filter(m => m.id !== idToRemove);
        updateValue(newMappings);
    };

    const canAddMapping = inputKey.trim() !== '' && inputValue !== null;

    return (
        <div className="role-mapping-container">
            <div className="mb-2">
                <small className="text-muted">
                    {translate('Map remote portal role names to local roles')}
                </small>
            </div>

            {/* Display existing mappings (read-only) */}
            {mappings.length > 0 && (
                <div className="mb-4">
                    <h6 className="mb-3">{translate('Configured Role Mappings')}</h6>
                    {mappings.map((mapping) => (
                        <div key={mapping.id} className="row mb-2 align-items-center">
                            <div className="col-md-5">
                                <div className="form-control-plaintext">
                                    <strong>{mapping.key}</strong>
                                </div>
                            </div>

                            <div className="col-md-1 text-center">
                                <span className="text-muted">→</span>
                            </div>

                            <div className="col-md-5">
                                <div className="form-control-plaintext">
                                    {mapping.value?.description || mapping.value?.name || 'Selected Role'}
                                </div>
                            </div>

                            <div className="col-md-1">
                                <button
                                    type="button"
                                    className="btn btn-outline-danger btn-sm"
                                    onClick={(e) => {
                                        e.preventDefault();
                                        e.stopPropagation();
                                        removeMapping(mapping.id);
                                    }}
                                    title={translate('Remove mapping')}
                                >
                                    <i className="fa fa-trash" />
                                </button>
                            </div>
                        </div>
                    ))}
                    <hr className="my-4" />
                </div>
            )}

            {/* Input form for new mappings */}
            <div className="mb-3">
                <h6 className="mb-3">{translate('Add New Role Mapping')}</h6>
                <div className="row mb-3 align-items-end">
                    <div className="col-md-5">
                        <label className="form-label small">
                            {translate('Remote Role Name')}
                        </label>
                        <input
                            type="text"
                            className="form-control"
                            placeholder={translate('e.g., admin, user, viewer')}
                            value={inputKey}
                            onChange={(e) => setInputKey(e.target.value)}
                            onBlur={onBlur}
                            onKeyDown={(e) => {
                                if (e.key === 'Enter' && canAddMapping) {
                                    e.preventDefault();
                                    addMapping();
                                }
                            }}
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
                            value={inputValue}
                            onChange={(value) => setInputValue(value)}
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
                            className={`btn btn-sm ${canAddMapping ? 'btn-primary' : 'btn-outline-secondary'}`}
                            onClick={(e) => {
                                e.preventDefault();
                                e.stopPropagation();
                                addMapping();
                            }}
                            disabled={!canAddMapping}
                            title={translate('Add mapping')}
                        >
                            <i className="fa fa-plus" />
                        </button>
                    </div>
                </div>
            </div>

            {/* Preview */}
            {mappings.length > 0 && (
                <div className="mt-3">
                    <small className="text-muted">
                        {translate('Preview')}: {JSON.stringify(
                            mappings.reduce((acc, m) => {
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