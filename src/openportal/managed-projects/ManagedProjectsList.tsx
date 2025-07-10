import { translate } from '@waldur/i18n';
import Table from '@waldur/table/Table';
import { createFetcher } from '@waldur/table/api';
import { useTable } from '@waldur/table/useTable';
import { formatDate } from '@waldur/core/dateUtils';


export const ManagedProjectsList = () => {
    const tableProps = useTable({
        table: `ManagedProjectsList`,
        fetchData: createFetcher('openportal-managed-projects'),
    });

    return (
        <Table
            {...tableProps}
            columns={[
                {
                    title: translate('Project'),
                    render: ({ row }) => row.details.name,
                },
                {
                    title: translate('Project Class'),
                    render: ({ row }) => row.details.class,
                },
                {
                    title: translate('Description'),
                    render: ({ row }) => row.details.description || '-',
                },
                {
                    title: translate('Members'),
                    // just render this dict as a string, or '-' if not available
                    render: ({ row }) => {
                        const members = row.details.members;
                        if (!members || Object.keys(members).length === 0) {
                            return '-';
                        }
                        return Object.entries(members)
                            .map(([key, value]) => `${key}: ${value}`)
                            .join(', ');
                    }
                },
                {
                    title: translate('Credits'),
                    render: ({ row }) => row.details.credits || '-',
                },
                /*                {
                                    title: translate('Start Date'),
                                    render: ({ row }) => {
                                        const startDate = row.details.start_date;
                                        return startDate ? formatDate(startDate) : '-';
                                    }
                                },
                                {
                                    title: translate('End Date'),
                                    render: ({ row }) => {
                                        const endDate = row.details.end_date;
                                        return endDate ? formatDate(endDate) : '-';
                                    }
                                },
                                {
                                    title: translate('Created'),
                                    remder: ({ row }) => formatDate(row.created),
                                }, */
                {
                    title: translate('State'),
                    render: ({ row }) => row.state,
                },
            ]}
        />
    );
};
