import classNames from 'classnames';
import React, { useState, FunctionComponent, useCallback } from 'react';
import { FormField } from '@waldur/form/types';
import { translate } from '@waldur/i18n';
import { Form } from 'react-bootstrap';

import { Select } from '@waldur/form/themed-select';

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

interface AllocationUnitsMappingProps extends FormField {
    placeholder?: string;
    validator?: any;
    solid?: boolean;
}

export const AllocationUnitsMappingField: FunctionComponent<AllocationUnitsMappingProps> = ({
    input,
    placeholder,
    validator,
    solid,
}) => {

    const [allocationUnit, setAllocationUnit] = useState(null);
    const [allocationValue, setAllocationValue] = useState(null);

    const addMapping = useCallback(() => {
        if (allocationUnit && allocationValue > 0) {
            let currentMappings = input.value || {};

            currentMappings[allocationUnit] = allocationValue;

            // Update the input value with the new mappings
            input.onChange(currentMappings);
            setAllocationUnit(null);
            setAllocationValue(null);

            console.log('Updated mappings:', currentMappings);
        }
    }, [allocationUnit, allocationValue, input]);

    const removeMapping = useCallback((unit: string) => {
        let currentMappings = input.value || {};
        if (currentMappings[unit]) {
            delete currentMappings[unit];
            input.onChange(currentMappings);
            console.log('Removed mapping for unit:', unit);
        }
    }, [input]);

    console.log('Current mappings:', input.value);

    return (
        <div className="allocation-units-mapping-field">
            <div className="mb-3">
                {input.value && input.value.length > 0 ? (
                    <>
                        <div className="text-muted">
                            {translate('Current mappings:')}
                        </div>
                        <ul className="list-group">
                            {
                                Object.entries(input.value).map(([unit, value]) => (
                                    <li key={unit} className="list-group-item d-flex justify-content-between align-items-center">
                                        <span>1 credit equals {value} {unit}</span>
                                        <button
                                            type="button"
                                            className="btn btn-sm btn-outline-danger"
                                            onClick={() => removeMapping(unit)}
                                            title={translate('Remove mapping')}
                                        >
                                            {translate('Remove')}
                                        </button>
                                    </li>
                                ))
                            }
                        </ul>
                    </>
                ) : (
                    <div className="text-muted">{translate('No mappings added yet.')}</div>
                )
                }
                <div className="text-muted mt-2">
                    {translate('Add a new mapping:')}
                </div>
                <div className="row mb-3 align-items-end">
                    <div className="col-md-5">
                        <Select
                            value={allocationUnit}
                            onChange={(value) => setAllocationUnit(value?.value)}
                            options={AllocationUnitsOptions}
                            onBlur={() => input.onBlur(allocationUnit)}
                            className="metronic-select-container"
                            classNamePrefix="metronic-select"
                        />
                    </div>
                    <div className="col-md-5">
                        <Form.Control
                            className={classNames(solid && 'form-control-solid', allocationUnit && 'has-unit')}
                            type="number"
                            value={allocationValue}
                            onChange={(e) => setAllocationValue(Number(e.target.value))}
                            placeholder={translate('e.g., 1000.00')}
                            step="0.01"
                            min="0"
                        />
                    </div>
                    <div className="col-md-2">
                        <button
                            type="button"
                            className={`btn btn-sm ${allocationUnit && allocationValue > 0 ? 'btn-primary' : 'btn-outline-secondary'}`}
                            onClick={addMapping}
                            disabled={!allocationUnit || allocationValue <= 0}
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