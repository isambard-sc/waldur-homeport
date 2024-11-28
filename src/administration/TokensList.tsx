import { TokenDeleteButton } from '@waldur/administration/TokenDeleteButton';
import { translate } from '@waldur/i18n';
import { createFetcher } from '@waldur/table/api';
import { BooleanField } from '@waldur/table/BooleanField';
import Table from '@waldur/table/Table';
import { useTable } from '@waldur/table/useTable';

export const TokensList = () => {
  const tableProps = useTable({
    table: `TokensList`,
    fetchData: createFetcher('auth-tokens'),
  });

  return (
    <Table
      {...tableProps}
      columns={[
        {
          title: translate('First name'),
          render: ({ row }) => row.user_first_name,
        },
        {
          title: translate('Last name'),
          render: ({ row }) => row.user_last_name,
        },
        {
          title: translate('Username'),
          render: ({ row }) => row.user_username,
        },
        {
          title: translate('Created'),
          render: ({ row }) => row.created,
        },
        {
          title: translate('Token lifetime (s)'),
          render: ({ row }) =>
            row.user_token_lifetime || translate('Unlimited'),
        },
        {
          title: translate('User is active'),
          render: ({ row }) => <BooleanField value={row.user_is_active} />,
        },
      ]}
      verboseName={translate('tokens')}
      showPageSizeSelector={true}
      rowActions={({ row }) => (
        <TokenDeleteButton row={row} refetch={tableProps.fetch} />
      )}
    />
  );
};
