import { useRouter } from '@uirouter/react';
import { FC } from 'react';

import { formatDateTime } from '@/core/dateUtils';
import { truncate } from '@/core/utils';
import { translate } from '@/i18n';
import Table from '@/table/Table';
import { Column } from '@/table/types';
import { useTable } from '@/table/useTable';

import { AIReportingNav } from './AIReportingNav';
import {
  fetchReportingSessions,
  ReportingSessionListItem,
} from './reportingSessionsApi';
import { setActiveReportingSessionUuid } from './session';
import { getAIReportingMessageRetentionDays } from './utils';

// Lists the caller's past conversations. Clicking one makes it this tab's
// active session and opens Chat, which shows its messages.
export const AIReportingHistoryPage: FC = () => {
  const router = useRouter();
  const retentionDays = getAIReportingMessageRetentionDays();

  const tableProps = useTable<ReportingSessionListItem>({
    table: 'aiReportingHistory',
    fetchData: fetchReportingSessions,
  });

  const openSession = (row: ReportingSessionListItem) => {
    setActiveReportingSessionUuid(row.uuid);
    router.stateService.go('reporting-ai-reporting');
  };

  const columns: Column<ReportingSessionListItem>[] = [
    {
      title: translate('Conversation'),
      render: ({ row }) => (
        <span title={row.first_prompt}>{truncate(row.first_prompt, 80)}</span>
      ),
    },
    {
      title: translate('Messages'),
      render: ({ row }) => row.message_count,
    },
    {
      title: translate('Last activity'),
      render: ({ row }) => formatDateTime(row.last_activity),
    },
  ];

  return (
    <div className="ai-reporting-history-page">
      <AIReportingNav />
      <p className="text-muted mb-4">
        {retentionDays != null
          ? translate(
              'Conversations are deleted automatically {days} days after they are created.',
              { days: retentionDays },
            )
          : translate('Conversations are deleted automatically after a while.')}
      </p>
      <Table<ReportingSessionListItem>
        {...tableProps}
        columns={columns}
        title={translate('History')}
        verboseName={translate('conversations')}
        hoverable
        onRowClick={openSession}
      />
    </div>
  );
};
