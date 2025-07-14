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
import { ProjectClassLink } from './ProjectClassLink';
import { ManagedProjectActions } from './ManagedProjectActions';

import { ManagedProjectsFilter } from './ManagedProjectsFilter';

const mapStateToFilter = createSelector(
    getFormValues('managedProjectsFilter'),
    (project, userFilter: any) => {
        const filter = {
            ...userFilter,
            feature: userFilter?.feature?.map((option) => option.value),
        };
        if (userFilter && isEmpty(userFilter.state)) {
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

    const onClickDetails = (row: any) => {
        console.log('Clicked on project:', row);
    };

    const onClickProjectClassDetails = (row: any) => {
        console.log('Clicked on project class:', row);
    };

    const columns: Array<Column> = [
        {
            title: translate('Project'),
            orderField: 'row.details.name',
            render: ({ row }) => (
                <ManagedProjectLink uuid={row.uuid} onClick={() => onClickDetails(row)}>
                    {row.details.name}
                </ManagedProjectLink>
            ),
            keys: ['name'],
            id: 'managedproject',
        },
        {
            title: translate('Project Class'),
            orderField: 'row.details.class',
            render: ({ row }) => (
                <ProjectClassLink uuid={row.details.class} onClick={() => onClickProjectClassDetails(row.details.class)}>
                    {row.details.class}
                </ProjectClassLink>
            ),
            keys: ['class'],
            id: 'projectclass',
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
            optional: true,
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