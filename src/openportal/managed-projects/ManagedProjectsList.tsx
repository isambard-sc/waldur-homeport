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
                    title: translate('Name'),
                    render: ({ row }) => row.name,
                },
                {
                    title: translate('Description'),
                    render: ({ row }) => row.description,
                },
                {
                    title: translate('Assigned users count'),
                    render: ({ row }) => row.users_count,
                },
            ]}
        />
    );
};
