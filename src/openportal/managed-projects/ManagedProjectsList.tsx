import { useSelector } from 'react-redux';
import { getFormValues } from 'redux-form';
import { createSelector } from 'reselect';

import { openportalManagedProjectsList } from 'waldur-js-client';

import { translate } from '@waldur/i18n';
import { Link } from '@waldur/core/Link';
import Table from '@waldur/table/Table';
import { createFetcher } from '@waldur/table/api';
import { useTable } from '@waldur/table/useTable';
import { Column } from '@waldur/table/types';
import { useTitle } from '@waldur/navigation/title';
import { formatDate, formatDateTime } from '@waldur/core/dateUtils';
import { DASH_ESCAPE_CODE } from '@waldur/table/constants';
import { renderFieldOrDash } from '@waldur/table/utils';
import { isEmpty } from '@waldur/core/utils';

import type { AwardDetails } from '../bindings/AwardDetails';
import { isEmbargoed } from './utils';

import { ManagedProjectActions } from './ManagedProjectActions';

import { ManagedProjectsFilter } from './ManagedProjectsFilter';


const mapStateToFilter = createSelector(
    getFormValues('managedProjectsFilter'),
    (userFilter: any) => {
        if (!userFilter) {
            return { state: ['pending'] };
        }

        // hide_embargoed is a client-side-only toggle — strip it before sending to the API
        const { hide_embargoed: _, ...rest } = userFilter;

        const filter: any = {
            ...rest,
            feature: rest?.feature?.map((option) => option.value),
        };

        if (rest.state && Array.isArray(rest.state) && rest.state.length > 0) {
            filter.state = rest.state.map((option) => option.value);
        } else if (isEmpty(rest.state)) {
            filter.state = ['pending'];
        }

        return filter;
    },
);

const selectHideEmbargoed = createSelector(
    getFormValues('managedProjectsFilter'),
    (values: any) => values?.hide_embargoed ?? false,
);

const renderProjectTemplate = (row: any) => {
    if (row.project_template_data) {
        return row.project_template_data.name;
    }

    const details = row.details as AwardDetails;
    return renderFieldOrDash(details.template);
}

const renderOffering = (destination: string) => {
    if (destination) {
        // split by "." and return the last part
        const parts = destination.split('.');
        return renderFieldOrDash(parts[parts.length - 1]);
    }
    return '-';
}

export const ManagedProjectsList = () => {
    useTitle(translate('Managed Projects'), '', 'browser');

    const filter = useSelector(mapStateToFilter);
    const hideEmbargoed = useSelector(selectHideEmbargoed);

    const tableProps = useTable({
        table: `ManagedProjectsList`,
        fetchData: createFetcher(openportalManagedProjectsList),
        queryField: 'query',
        filter,
    });

    const columns: Array<Column> = [
        {
            title: translate('Project'),
            orderField: 'details__name',
            render: ({ row }) => (
                <Link
                    state="marketplace-provider-managed-project-detail"
                    params={{ identifier: row.identifier, destination: row.destination }}
                >
                    {(row.details as AwardDetails).name || row.identifier || '—'}
                </Link>
            ),
            keys: ['name'],
            id: 'managedproject',
        },
        {
            title: translate('Identifier'),
            orderField: 'identifier',
            render: ({ row }) => renderFieldOrDash(row.identifier),
            keys: ['identifier'],
            optional: true,
            id: 'identifier',
        },
        {
            title: translate('Offering'),
            orderField: 'project_template__offering',
            render: ({ row }) => renderOffering(row.destination),
            keys: ['offering'],
            id: 'offering',
        },
        {
            title: translate('Project Template'),
            orderField: 'project_template__name',
            render: ({ row }) => renderProjectTemplate(row),
            keys: ['project-template'],
            id: 'project-template',
        },
        {
            title: translate('Description'),
            render: ({ row }) => renderFieldOrDash((row.details as AwardDetails).description),
            keys: ['description'],
            optional: true,
            id: 'description',
        },
        {
            title: translate('Created'),
            orderField: 'created',
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
                    {(row.details as AwardDetails).start_date
                        ? formatDate((row.details as AwardDetails).start_date)
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
                    {(row.details as AwardDetails).end_date
                        ? formatDate((row.details as AwardDetails).end_date)
                        : DASH_ESCAPE_CODE}
                </>
            ),
            keys: ['end_date'],
            optional: true,
            id: 'end_date',
        },
        {
            title: translate('Allocation'),
            render: ({ row }) => renderFieldOrDash((row.details as AwardDetails).allocation),
            keys: ['allocation'],
            id: 'allocation',
        },
        {
            title: translate('State'),
            orderField: 'state',
            render: ({ row }) => (
                <>
                    {row.state}
                    {isEmbargoed(row) && (
                        <span className="badge bg-warning text-dark ms-1">
                            {translate('Embargoed')}
                        </span>
                    )}
                </>
            ),
            keys: ['state'],
            id: 'state',
        },
    ];

    const rows = hideEmbargoed
        ? (tableProps.rows || []).filter((row) => !isEmbargoed(row))
        : tableProps.rows;

    return (
        <Table
            {...tableProps}
            rows={rows}
            columns={columns}
            verboseName={translate('Managed Projects')}
            title={translate('Managed Projects')}
            showPageSizeSelector={true}
            standalone
            hasQuery
            hasOptionalColumns
            rowActions={({ row }) => (
                <ManagedProjectActions project={row} refetch={tableProps.fetch} />
            )}
            filters={<ManagedProjectsFilter />}
        />
    );
};
