import { FunctionComponent, useCallback, useMemo } from 'react';
import { Field } from 'react-final-form';
import { debounce } from 'lodash';

import { translate } from '@waldur/i18n';
import { AsyncPaginate } from '@waldur/form/themed-select';
import { organizationAutocomplete } from '@waldur/marketplace/common/autocompletes';

export const OrganizationAutocompleteField: FunctionComponent<{
    name: string;
    placeholder?: string;
    validator?: any;
    noOptionsMessage?: string;
    reactSelectProps?: any;
    debounceMs?: number;
}> = (props) => {
    const debouncedAutocomplete = useMemo(
        () => debounce(
            (query: string, prevOptions: any, page: number, options: any, resolve: Function) => {
                organizationAutocomplete(query, prevOptions, page, options).then(resolve);
            },
            props.debounceMs || 1000
        ),
        [props.debounceMs]
    );

    const loadOptions = useCallback(
        (query: string, prevOptions: any, { page }: { page: number }) => {
            return new Promise((resolve) => {
                debouncedAutocomplete(query, prevOptions, page, {
                    field: ['name', 'uuid', 'abbreviation'],
                    o: 'name',
                }, resolve);
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
                    placeholder={props.placeholder || translate('Select organization...')}
                    loadOptions={loadOptions}
                    defaultOptions
                    getOptionValue={(option) => option.uuid}
                    getOptionLabel={(option) => option.name}
                    value={input.value}
                    onChange={(value) => input.onChange(value)}
                    onBlur={() => input.onBlur()}
                    noOptionsMessage={() =>
                        props.noOptionsMessage || translate('No organizations')
                    }
                    isClearable={true}
                    className="metronic-select-container"
                    classNamePrefix="metronic-select"
                    {...props.reactSelectProps}
                />
            )}
        />
    );
};
