import React, { useState, useEffect, FunctionComponent, useRef } from 'react';
import { Field } from 'react-final-form';
import { translate } from '@waldur/i18n';
import { SelectField } from '@waldur/form/SelectField';
import { NumberField } from '@waldur/form/NumberField';
import { FormGroup } from '@waldur/marketplace/offerings/FormGroup';

export const AllocationUnitsMappingField: FunctionComponent<{
    name: string;
    placeholder?: string;
    validator?: any;
}> = (props) => (
    <Field
        name={props.name}
        validate={props.validator}
        component={({ input, meta }) => (
            <AllocationUnitsMappingComponent
                value={input.value}
                onChange={input.onChange}
                onBlur={input.onBlur}
                placeholder={props.placeholder}
            />
        )}
    />
);

export const AllocationUnitsOptions = [
    {
        label: translate('Node Hour'),
        value: 'NHR',
    },
    {
        label: translate('CPU Hour'),
        value: 'CPUHR',
    },
    {
        label: translate('Core Hour'),
        value: 'COREHR',
    },
    {
        label: translate('GPU Hour'),
        value: 'GPUHR',
    },
    {
        label: translate('Memory GB Hour'),
        value: 'GBHR',
    }
];


const AllocationUnitsMappingComponent: FunctionComponent<{
    value?: Record<string, any>;
    onChange: (value: Record<string, any>) => void;
    onBlur: () => void;
    placeholder?: string;
    debounceMs?: number;
}> = ({ value = {}, onChange, placeholder }) => {
    const [mappings, setMappings] = useState<Array<{ key: string; value: any; id: string }>>([]);
    const [initialized, setInitialized] = useState(false);

    const [allocationUnit, setAllocationUnit] = useState(null);
    const [allocationValue, setAllocationValue] = useState(0);

    const idCounterRef = useRef(0);

    useEffect(() => {
        if (!initialized) {
            if (value && Object.keys(value).length > 0) {
                const initialMappings = Object.entries(value).map(([key, val], index) => ({
                    key,
                    value: val,
                    id: `allocation-mapping-${index}`
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
        if (!allocationUnit || allocationValue === null || allocationValue <= 0) {
            return;
        }

        let newMappings = [...mappings];

        // Check if key already exists - if it does, remove it
        if (mappings.some(m => m.key === allocationUnit)) {
            newMappings = mappings.filter(m => m.key !== allocationUnit);
        }

        const newMapping = {
            key: allocationUnit,
            value: 1.0 / allocationValue,
            id: `allocation-mapping-${++idCounterRef.current}`
        };

        newMappings = [newMapping, ...newMappings];

        updateValue(newMappings);

        // Clear input form
        setAllocationUnit(null);
        setAllocationValue(0.0);
    };

    const removeMapping = (unit: string) => {
        const newMappings = mappings.filter(m => m !== unit);
        updateValue(newMappings);
    };

    const canAddMapping = allocationUnit && allocationValue > 0;

    return (
        <div className="allocation-units-mapping-container">
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
                                    {mapping.value}
                                </div>
                            </div>

                            <div className="col-md-1">
                                <button
                                    type="button"
                                    className="btn btn-outline-danger btn-sm"
                                    onClick={(e) => {
                                        e.preventDefault();
                                        e.stopPropagation();
                                        removeMapping(mapping.key);
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
                            {translate('Unit of allocation')}
                        </label>
                        <select
                            value={allocationUnit}
                            onChange={(e) => setAllocationUnit(e.target.value)}
                            className="form-control"
                        >
                            <option value="">{translate('Select...')}</option>
                            {AllocationUnitsOptions.map(option => (
                                <option key={option.value} value={option.value}>
                                    {option.label}
                                </option>
                            ))}
                        </select>
                    </div>

                    <div className="col-md-5">
                        <FormGroup controlId="units_per_credit" label={translate('Units per credit, i.e. 4 GPU hours per credit')}>
                            <Field
                                name="units_per_credit"
                                component={NumberField as any}
                                placeholder={translate('e.g., 1000.00')}
                                step="0.01"
                                min="0"
                                help={translate('Enter the number of allocation units per credit. For example, if 1 credit equals 4 GPU hours, enter 4.')}
                            />
                        </FormGroup>
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
