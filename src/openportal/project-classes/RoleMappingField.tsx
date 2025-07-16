import React, { useState, useEffect, useCallback, useMemo, FunctionComponent, useRef } from 'react';
import { Field } from 'react-final-form';
import { debounce } from 'lodash';

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
    debounceMs?: number;
}> = ({ value = {}, onChange, onBlur, placeholder, debounceMs }) => {
    const [mappings, setMappings] = useState<Array<{ key: string; value: any; id: string }>>([]);
    const [initialized, setInitialized] = useState(false);

    const [inputKey, setInputKey] = useState('');
    const [inputValue, setInputValue] = useState(null);

    const idCounterRef = useRef(0);

    const debouncedRoleAutocomplete = useMemo(
        () => debounce(
            (query: string, prevOptions: any, page: { page: number }, resolve: Function) => {
                roleAutocomplete(query, prevOptions, page).then(resolve);
            },
            debounceMs || 1000
        ),
        [debounceMs]
    );

    const loadRoleOptions = useCallback(
        (query: string, prevOptions: any, { page }: { page: number }) => {
            return new Promise((resolve) => {
                debouncedRoleAutocomplete(query, prevOptions, page, resolve);
            });
        },
        [debouncedRoleAutocomplete]
    );

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

    const updateValue = (newMappings: Array<{ key: string; value: any; id: string }>) => {
        setMappings(newMappings);

        const dictionary = newMappings.reduce((acc, mapping) => {
            acc[mapping.key] = mapping.value;
            return acc;
        }, {} as Record<string, any>);

        onChange(dictionary);
    };

    const addMapping = () => {
        if (!inputKey.trim() || !inputValue) {
            return;
        }

        let newMappings = [...mappings];

        // Check if key already exists - if it does, remove it
        if (mappings.some(m => m.key === inputKey.trim())) {
            newMappings = mappings.filter(m => m.key !== inputKey.trim());
        }

        const newMapping = {
            key: inputKey.trim(),
            value: inputValue,
            id: `mapping-${++idCounterRef.current}`
        };

        newMappings = [newMapping, ...newMappings];
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
            {mappings.length > 0 && (
                <div className="mb-4">
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
                                    {translate('Remove')}
                                </button>
                            </div>
                        </div>
                    ))}
                    <hr className="my-4" />
                </div>
            )}

            {/* Input form for new mappings */}
            <div className="mb-3">
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

                    <div className="col-md-5">
                        <label className="form-label small">
                            {translate('Local Role')}
                        </label>
                        <AsyncPaginate
                            placeholder={translate('Select local role...')}
                            loadOptions={loadRoleOptions}
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
                            {translate('Add')}
                        </button>
                    </div>
                </div>
            </div>
        </div>
    );
};
