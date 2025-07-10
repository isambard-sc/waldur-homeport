import { translate } from '@waldur/i18n';
import Table from '@waldur/table/Table';
import { createFetcher } from '@waldur/table/api';
import { useTable } from '@waldur/table/useTable';
import { Column } from '@waldur/table/types';
import { useTitle } from '@waldur/navigation/title';
import { formatDateTime } from '@waldur/core/dateUtils';
import { DASH_ESCAPE_CODE } from '@waldur/table/constants';
import { renderFieldOrDash } from '@waldur/table/utils';

import { ManagedProjectExpandableRow } from './ManagedProjectExpandableRow';
import { ManagedProjectLink } from './ManagedProjectLink';
import { ProjectClassLink } from './ProjectClassLink';


export const ManagedProjectsList = () => {
    useTitle(translate('Managed Projects'), '', 'browser');

    const tableProps = useTable({
        table: `ManagedProjectsList`,
        fetchData: createFetcher('openportal-managed-projects'),
        queryField: 'query',
    });

    const onClickDetails = (row: any) => {
        // Handle the click event for project details
        console.log('Clicked on project:', row);
        // You can navigate to a details page or perform any other action here
    };

    const onClickProjectClassDetails = (row: any) => {
        // Handle the click event for project class details
        console.log('Clicked on project class:', row);
        // You can navigate to a details page or perform any other action here
    };

    const columns: Array<Column> = [
        {
            title: translate('Project'),
            orderField: 'details.name',
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
            orderField: 'details.class',
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
                        ? formatDateTime(row.details.start_date)
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
                        ? formatDateTime(row.details.end_date)
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
            hasQuery={true}
            showPageSizeSelector={true}
            enableExport={true}
            standalone
            hasOptionalColumns
            expandableRowClassName="py-2 pe-2"
            expandableRow={ManagedProjectExpandableRow}
        />
    );
};
