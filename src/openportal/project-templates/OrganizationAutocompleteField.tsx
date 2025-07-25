import { FunctionComponent, useCallback, useMemo } from 'react';
import { debounce } from 'lodash';
import { FormField } from '@waldur/form/types';

import { translate } from '@waldur/i18n';
import { AsyncPaginate } from '@waldur/form/themed-select';
import { organizationAutocomplete } from '@waldur/marketplace/common/autocompletes';

interface OrganizationAutocompleteProps extends FormField {
    placeholder?: string;
    validator?: any;
    noOptionsMessage?: string;
    reactSelectProps?: any;
    debounceMs?: number;
}


export const OrganizationAutocompleteField: FunctionComponent<OrganizationAutocompleteProps> = ({
    input,
    placeholder,
    validator,
    noOptionsMessage,
    reactSelectProps,
    debounceMs,
}) => {
    const debouncedAutocomplete = useMemo(
        () => debounce(
            (query: string, prevOptions: any, page: number, options: any, resolve: Function) => {
                organizationAutocomplete(query, prevOptions, page, options).then(resolve);
            },
            debounceMs || 1000
        ),
        [debounceMs]
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
        <AsyncPaginate
            placeholder={placeholder || translate('Select organization...')}
            loadOptions={loadOptions}
            defaultOptions
            getOptionValue={(option) => option.uuid}
            getOptionLabel={(option) => option.name}
            value={input.value}
            onChange={(value) => input.onChange(value)}
            onBlur={() => input.onBlur()}
            noOptionsMessage={() =>
                noOptionsMessage || translate('No organizations')
            }
            isClearable={true}
            className="metronic-select-container"
            classNamePrefix="metronic-select"
            {...reactSelectProps}
        />
    );
};
