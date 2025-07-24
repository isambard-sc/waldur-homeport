import { FunctionComponent, useCallback, useMemo } from 'react';
import { debounce } from 'lodash';
import { FormField } from '@waldur/form/types';

import { AsyncPaginate } from '@waldur/form/themed-select';
import { translate } from '@waldur/i18n';

import { Options, ProjectsListData, ProjectsListResponse } from 'waldur-js-client';
import { client } from 'waldur-js-client/client.gen';

import { parseSelectData } from '@waldur/core/api';
import { returnReactSelectAsyncPaginateObject } from '@waldur/core/utils';

// Type definitions
interface UnmanagedProjectsQuery {
    search?: string;
    page?: number;
    field?: string[];
    o?: string;
    customer_uuid?: string;
    [key: string]: any; // Allow additional query parameters
}

interface ProjectOption {
    uuid: string;
    name: string;
    abbreviation?: string;
}

interface ProjectAutocompleteProps extends FormField {
    placeholder?: string;
    validator?: any;
    query?: Record<string, any>;
    noOptionsMessage?: string;
    reactSelectProps?: any;
    debounceMs?: number;
}

// API function with proper typing
export const unmanagedProjectsList = <ThrowOnError extends boolean = false>(
    query?: UnmanagedProjectsQuery,
    options?: Options<ProjectsListData, ThrowOnError>
) => {
    console.log('unmanagedProjectsList query:', query, 'options:', options);

    return (options?.client ?? client).get<ProjectsListResponse, unknown, ThrowOnError>({
        security: [
            {
                name: 'Authorization',
                type: 'apiKey'
            }
        ],
        url: '/api/openportal-unmanaged-projects/',
        query: query,
        ...options
    });
};

// Improved autocomplete function with proper error handling
export const unmanagedProjectAutocomplete = async (
    searchQuery: string,
    prevOptions: ProjectOption[],
    currentPage: number,
    options: Partial<UnmanagedProjectsQuery> = {},
): Promise<{
    options: ProjectOption[];
    hasMore: boolean;
    additional?: { page: number };
}> => {
    try {
        console.log('unmanagedProjectAutocomplete', { searchQuery, currentPage, options });

        const queryParams: UnmanagedProjectsQuery = {
            search: searchQuery,
            page: currentPage,
            field: options.field || ['name', 'uuid', 'abbreviation'],
            o: options.o || 'name',
            ...options, // Spread additional options like customer_uuid
        };

        const response = await unmanagedProjectsList(queryParams);

        return returnReactSelectAsyncPaginateObject(
            parseSelectData(response),
            prevOptions,
            currentPage,
        );
    } catch (error) {
        console.error('Error fetching unmanaged projects:', error);
        // Return empty result on error to prevent component from breaking
        return {
            options: prevOptions || [],
            hasMore: false,
        };
    }
};

// Main component with improvements
export const ProjectAutocompleteField: FunctionComponent<ProjectAutocompleteProps> = ({
    input,
    placeholder,
    validator,
    query = {}, // Provide default empty object
    noOptionsMessage,
    reactSelectProps = {}, // Provide default empty object
    debounceMs = 300, // Reduced default debounce time for better UX
    ...props
}) => {
    // Create a stable query options object to prevent unnecessary re-renders
    const queryOptions = useMemo(() => ({
        field: ['name', 'uuid', 'abbreviation'],
        o: 'name',
        ...query,
    }), [query]);

    // Memoize the debounced function with query as dependency
    const debouncedAutocomplete = useMemo(
        () => debounce(
            async (
                searchQuery: string,
                prevOptions: ProjectOption[],
                page: number,
                options: Partial<UnmanagedProjectsQuery>,
                resolve: (result: any) => void
            ) => {
                try {
                    const result = await unmanagedProjectAutocomplete(searchQuery, prevOptions, page, options);
                    resolve(result);
                } catch (error) {
                    console.error('Debounced autocomplete error:', error);
                    resolve({ options: prevOptions || [], hasMore: false });
                }
            },
            debounceMs
        ),
        [debounceMs, queryOptions] // Include queryOptions as dependency
    );

    // Cleanup debounced function on unmount
    const cleanupDebouncedFunction = useCallback(() => {
        debouncedAutocomplete.cancel();
    }, [debouncedAutocomplete]);

    // Use effect to cleanup on unmount would go here if needed
    // useEffect(() => {
    //     return cleanupDebouncedFunction;
    // }, [cleanupDebouncedFunction]);

    const loadOptions = useCallback(
        (searchQuery: string, prevOptions: ProjectOption[], { page }: { page: number }) => {
            return new Promise<{
                options: ProjectOption[];
                hasMore: boolean;
                additional?: { page: number };
            }>((resolve) => {
                debouncedAutocomplete(searchQuery, prevOptions, page, queryOptions, resolve);
            });
        },
        [debouncedAutocomplete, queryOptions]
    );

    // Memoize handlers to prevent unnecessary re-renders
    const handleChange = useCallback((value: ProjectOption | null) => {
        input.onChange(value);
    }, [input]);

    const handleBlur = useCallback(() => {
        input.onBlur();
    }, [input]);

    const getNoOptionsMessage = useCallback(() =>
        noOptionsMessage || translate('No projects found'),
        [noOptionsMessage]
    );

    return (
        <AsyncPaginate
            placeholder={placeholder || translate('Select project...')}
            loadOptions={loadOptions}
            defaultOptions
            getOptionValue={(option: ProjectOption) => option.uuid}
            getOptionLabel={(option: ProjectOption) => option.name}
            value={input.value}
            onChange={handleChange}
            onBlur={handleBlur}
            noOptionsMessage={getNoOptionsMessage}
            isClearable={true}
            className="metronic-select-container"
            classNamePrefix="metronic-select"
            {...reactSelectProps}
        />
    );
};