import { FC } from 'react';

import { formatDateTime } from '@/core/dateUtils';
import { truncate } from '@/core/utils';
import { FileDownloader } from '@/form/upload/FileDownloader';
import { translate } from '@/i18n';
import { ActionsDropdown } from '@/table/ActionsDropdown';
import Table from '@/table/Table';
import { Column } from '@/table/types';
import { useTable } from '@/table/useTable';

import { AIReportingNav } from './AIReportingNav';
import { ReportingFileDeleteAction } from './ReportingFileDeleteAction';
import {
  fetchReportingFiles,
  ReportingFileListItem,
} from './reportingFilesApi';
import { getAIReportingFileRetentionDays } from './utils';

// A standalone page rather than part of the report catalogue, like the
// other AI reporting pages. Wired in through routes.ts.
export const AIReportingFilesPage: FC = () => {
  const retentionDays = getAIReportingFileRetentionDays();

  const tableProps = useTable<ReportingFileListItem>({
    table: 'aiReportingFiles',
    fetchData: fetchReportingFiles,
  });

  const columns: Column<ReportingFileListItem>[] = [
    {
      title: translate('Name'),
      render: ({ row }) => row.name,
      export: 'name',
      exportTitle: translate('Name'),
    },
    {
      title: translate('From question'),
      render: ({ row }) => (
        <span className="text-muted" title={row.prompt}>
          {truncate(row.prompt, 60)}
        </span>
      ),
    },
    {
      title: translate('Created'),
      render: ({ row }) => formatDateTime(row.created),
      export: 'created',
      exportTitle: translate('Created'),
    },
    {
      title: translate('Download'),
      render: ({ row }) => (
        <FileDownloader url={row.file} name={row.name} size={16} />
      ),
    },
  ];

  return (
    <div className="ai-reporting-files-page">
      <AIReportingNav />
      <p className="text-muted mb-4">
        {retentionDays != null
          ? translate(
              'Files are deleted automatically {days} days after they are created - delete one sooner here if you no longer need it.',
              { days: retentionDays },
            )
          : translate(
              'Files are deleted automatically after a while - delete one sooner here if you no longer need it.',
            )}
      </p>
      <Table<ReportingFileListItem>
        {...tableProps}
        columns={columns}
        title={translate('Files')}
        verboseName={translate('files')}
        enableExport
        rowActions={({ row, fetch }) => (
          <ActionsDropdown row={row} refetch={fetch}>
            <ReportingFileDeleteAction row={row} refetch={fetch} />
          </ActionsDropdown>
        )}
      />
    </div>
  );
};
