import { FunctionComponent, useCallback, useMemo } from 'react';
import { Field } from 'react-final-form';
import { debounce } from 'lodash';

import { translate } from '@waldur/i18n';
import { AsyncPaginate } from '@waldur/form/themed-select';
import { providerOfferingsAutocomplete } from '@waldur/marketplace/common/autocompletes';


export const OfferingAutocompleteField: FunctionComponent<{
    name: string;
    placeholder?: string;
    validator?: any;
    noOptionsMessage?: string;
    reactSelectProps?: any;
    isMulti?: boolean;
    debounceMs?: number;
}> = (props) => {
    const debouncedAutocomplete = useMemo(
        () => debounce(
            (query: string, prevOptions: any, currentPage: number, resolve: Function) => {
                providerOfferingsAutocomplete(query, prevOptions, currentPage).then(resolve);
            },
            props.debounceMs || 1000
        ),
        [props.debounceMs]
    );

    const loadOptions = useCallback(
        (query: string, prevOptions: any, { currentPage }: { currentPage: number }) => {
            return new Promise((resolve) => {
                debouncedAutocomplete(query, prevOptions, currentPage, resolve);
            });
        },
        [debouncedAutocomplete]
    );

    return (
        <Field
            name={props.name}
            validate={props.validator}
            component={({ input, meta }) => (
                <AsyncPaginate
                    placeholder={props.placeholder || translate('Select offering...')}
                    loadOptions={loadOptions}
                    defaultOptions
                    getOptionValue={(option) => option.uuid}
                    getOptionLabel={(option) => option.name}
                    value={props.isMulti ? (input.value || []) : input.value}
                    onChange={(value) => input.onChange(props.isMulti ? (value || []) : value)}
                    onBlur={() => input.onBlur()}
                    noOptionsMessage={() =>
                        props.noOptionsMessage || translate('No public offerings')
                    }
                    isClearable={true}
                    isMulti={props.isMulti}
                    className="metronic-select-container"
                    classNamePrefix="metronic-select"
                    {...props.reactSelectProps}
                />
            )}
        />
    );
};