import { useSelector } from 'react-redux';
import { getFormValues } from 'redux-form';
import { createSelector } from 'reselect';

import { translate } from '@waldur/i18n';
import Table from '@waldur/table/Table';
import { createFetcher } from '@waldur/table/api';
import { useTable } from '@waldur/table/useTable';
import { Column } from '@waldur/table/types';
import { useTitle } from '@waldur/navigation/title';
import { formatDate, formatDateTime } from '@waldur/core/dateUtils';
import { DASH_ESCAPE_CODE } from '@waldur/table/constants';
import { renderFieldOrDash } from '@waldur/table/utils';
import { isEmpty } from '@waldur/core/utils';

import { ManagedProjectExpandableRow } from './ManagedProjectExpandableRow';
import { ManagedProjectLink } from './ManagedProjectLink';
import { ProjectTemplateLink } from './ProjectTemplateLink';
import { ManagedProjectActions } from './ManagedProjectActions';

import { ManagedProjectsFilter } from './ManagedProjectsFilter';


const mapStateToFilter = createSelector(
    getFormValues('managedProjectsFilter'),
    (userFilter: any) => {
        if (!userFilter) {
            // If no filter is set, default to pending
            return { state: ['pending'] };
        }

        const filter = {
            ...userFilter,
            feature: userFilter?.feature?.map((option) => option.value),
        };

        // Handle state filter
        if (userFilter.state && Array.isArray(userFilter.state) && userFilter.state.length > 0) {
            // If state is selected, map to values
            filter.state = userFilter.state.map((option) => option.value);
        } else if (isEmpty(userFilter.state)) {
            // If no state is selected, default to pending
            filter.state = ['pending'];
        }

        return filter;
    },
);


export const ManagedProjectsList = () => {
    useTitle(translate('Managed Projects'), '', 'browser');

    // Get filter values from redux-form
    const filter = useSelector(mapStateToFilter);

    const tableProps = useTable({
        table: `ManagedProjectsList`,
        fetchData: createFetcher('openportal-managed-projects'),
        queryField: 'query',
        filter,
    });

    const columns: Array<Column> = [
        {
            title: translate('Project'),
            orderField: 'row.details.name',
            render: ({ row }) => renderFieldOrDash(row.details.name),
            keys: ['name'],
            id: 'managedproject',
        },
        {
            title: translate('Project Template'),
            orderField: 'row.details.class',
            render: ({ row }) => renderFieldOrDash(row.details.class),
            keys: ['project-template'],
            id: 'project-template',
        },
        {
            title: translate('Description'),
            render: ({ row }) => renderFieldOrDash(row.details.description),
            keys: ['description'],
            optional: true,
            id: 'description',
        },
        {
            title: translate('Created'),
            render: ({ row }) => (
                <>
                    {row.created
                        ? formatDateTime(row.created)
                        : DASH_ESCAPE_CODE}
                </>
            ),
            keys: ['created_date'],
            optional: true,
            id: 'created_date',
        },
        {
            title: translate('Start Date'),
            render: ({ row }) => (
                <>
                    {row.details.start_date
                        ? formatDate(row.details.start_date)
                        : DASH_ESCAPE_CODE}
                </>
            ),
            keys: ['start_date'],
            optional: true,
            id: 'start_date',
        },
        {
            title: translate('End Date'),
            render: ({ row }) => (
                <>
                    {row.details.end_date
                        ? formatDate(row.details.end_date)
                        : DASH_ESCAPE_CODE}
                </>
            ),
            keys: ['end_date'],
            optional: true,
            id: 'end_date',
        },
        {
            title: translate('Credits'),
            render: ({ row }) => renderFieldOrDash(row.details.credits),
            keys: ['credits'],
            id: 'credits',
        },
        {
            title: translate('State'),
            render: ({ row }) => (
                <>
                    {row.state}
                </>
            ),
            keys: ['state'],
            id: 'state',
        },
    ];

    return (
        <Table
            {...tableProps}
            columns={columns}
            verboseName={translate('Managed Projects')}
            title={translate('Managed Projects')}
            showPageSizeSelector={true}
            standalone
            hasOptionalColumns
            expandableRowClassName="py-2 pe-2"
            expandableRow={ManagedProjectExpandableRow}
            rowActions={({ row }) => (
                <ManagedProjectActions project={row} refetch={tableProps.fetch} />
            )}
            filters={<ManagedProjectsFilter />}
        />
    );
};
