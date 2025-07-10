import { translate } from '@waldur/i18n';
import Table from '@waldur/table/Table';
import { createFetcher } from '@waldur/table/api';
import { useTable } from '@waldur/table/useTable';

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
                    title: translate('Identifier'),
                    render: ({ row }) => row.identifier,
                },
                {
                    title: translate('Details'),
                    render: ({ row }) => row.details,
                },
                {
                    title: translate('State'),
                    render: ({ row }) => row.state,
                },
            ]}
        />
    );
};
