import { FC, useState } from 'react';

import { formatUsageValue } from '@/core/formatNumber';
import { LoadingErred } from '@/core/LoadingErred';
import { LoadingSpinner } from '@/core/LoadingSpinner';
import { SummaryWidget } from '@/core/SummaryWidget';
import { translate } from '@/i18n';
import { NoResult } from '@/navigation/header/search/NoResult';

import { OrdersFilter } from '../reporting/orders/OrdersFilter';

import { UsageByUserTable } from './UsageByUserTable';
import { UsageDailyChart } from './UsageDailyChart';
import { useUsageStats } from './useUsageStats';

// A standalone page, not part of the category-report system (getCategoryConfig/
// ReportingReportList) - same reasoning as AIReportingPage.tsx itself: this is
// one dashboard, not a catalogue of reports, so that machinery would be
// unneeded boilerplate. See routes.ts/tabs.ts for how it's wired in.
export const AIReportingUsagePage: FC = () => {
  const [days, setDays] = useState(30);
  const { isLoading, error, refetch, data } = useUsageStats(days);

  return (
    <>
      <div className="d-flex justify-content-between align-items-center flex-wrap gap-4 mb-5">
        <div>
          <h3 className="mb-1">{translate('AI reporting usage')}</h3>
          <p className="text-muted mb-0">
            {translate(
              'Actual token usage across every AI reporting question asked, for staff and allocators.',
            )}
          </p>
        </div>
        <OrdersFilter days={days} onDaysChange={setDays} />
      </div>

      {isLoading ? (
        <LoadingSpinner />
      ) : error ? (
        <LoadingErred loadData={refetch} />
      ) : data ? (
        <>
          <SummaryWidget
            stats={[
              {
                label: translate('Requests'),
                value: formatUsageValue(data.total_requests),
              },
              {
                label: translate('Input tokens'),
                value: formatUsageValue(data.total_input_tokens, true),
              },
              {
                label: translate('Output tokens'),
                value: formatUsageValue(data.total_output_tokens, true),
              },
            ]}
          />

          <div className="mb-6">
            <UsageDailyChart daily={data.daily} />
          </div>

          <UsageByUserTable byUser={data.by_user} />
        </>
      ) : (
        <NoResult
          title={translate('No data available')}
          message={translate(
            'No AI reporting usage found for the selected period.',
          )}
          noAction
        />
      )}
    </>
  );
};
