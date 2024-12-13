import { FC } from 'react';

import { CopyToClipboardButton } from '@waldur/core/CopyToClipboardButton';
import { translate } from '@waldur/i18n';
import { ExpandableContainer } from '@waldur/table/ExpandableContainer';
import Table from '@waldur/table/Table';
import { useTable } from '@waldur/table/useTable';

import { RemoteSync, RemoteSyncCategoryRule } from './types';

const FieldWithCopy = ({ value }) => {
  return (
    <>
      {value}
      <CopyToClipboardButton value={value} className="ms-2 d-inline-block" />
    </>
  );
};

export const RemoteSyncExpandableRow: FC<{
  row: RemoteSync;
}> = ({ row: remoteSync }) => {
  const tableProps = useTable({
    table: 'RemoteSyncCategoryRules-' + remoteSync.uuid,
    fetchData: () =>
      Promise.resolve({
        rows: remoteSync.remotelocalcategory_set,
      }),
  });

  return (
    <ExpandableContainer>
      <Table<RemoteSyncCategoryRule>
        {...tableProps}
        columns={[
          {
            title: translate('Remote category name'),
            render: ({ row }) => (
              <span className="text-dark">
                <FieldWithCopy value={row.remote_category_name} />
              </span>
            ),
          },
          {
            title: translate('Local category name'),
            render: ({ row }) => (
              <FieldWithCopy value={row.local_category_name} />
            ),
          },
          {
            title: translate('Remote category UUID'),
            render: ({ row }) => <FieldWithCopy value={row.remote_category} />,
          },
          {
            title: translate('Local category UUID'),
            render: ({ row }) => (
              <FieldWithCopy value={row.local_category_uuid} />
            ),
          },
        ]}
        verboseName={translate('Category rules')}
        initialSorting={{ field: 'remote_category', mode: 'desc' }}
        placeholderComponent={
          <div>
            <p className="text-muted text-center">
              {translate('No items found')}
            </p>
          </div>
        }
        hasActionBar={false}
        cardBordered={false}
        minHeight="auto"
      />
    </ExpandableContainer>
  );
};
