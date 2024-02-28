import { useQuery } from '@tanstack/react-query';
import { FC } from 'react';

import { AdministrationProfile } from '@waldur/administration/dashboard/AdministrationProfile';
import { HealthChecks } from '@waldur/administration/dashboard/HealthChecks';
import { BroadcastList } from '@waldur/broadcasts/BroadcastList';
import { ENV } from '@waldur/configs/default';
import { LoadingErred } from '@waldur/core/LoadingErred';
import { LoadingSpinner } from '@waldur/core/LoadingSpinner';
import { translate } from '@waldur/i18n';
import { IssuesList } from '@waldur/issues/list/IssuesList';
import {
  getBackendHealthStatus,
  isWorking,
} from '@waldur/navigation/BackendHealthStatusIndicator';

import { StatisticsCards } from './StatisticsCards';

export const SupportDashboard: FC = () => {
  const { data, isLoading, error, refetch } = useQuery(
    ['HealthStatus'],
    () => getBackendHealthStatus(),
    { staleTime: 5 * 60 * 1000 },
  );

  const healthy = isWorking(data);
  const isSupportEnabled = ENV.plugins.WALDUR_SUPPORT?.ENABLED;

  return (
    <>
      {isLoading ? (
        <LoadingSpinner />
      ) : error ? (
        <LoadingErred
          message={translate('Unable to load health information')}
          loadData={refetch}
        />
      ) : data ? (
        <AdministrationProfile healthy={healthy} supportOnly />
      ) : null}
      {isSupportEnabled ? <StatisticsCards /> : null}
      {data && <HealthChecks healthInfoItems={data} />}
      {isSupportEnabled ? (
        <IssuesList
          className="mb-6"
          title={translate('Open issues')}
          filter={{ status: 'Open' }}
          initialPageSize={5}
          showPageSizeSelector={false}
        />
      ) : null}

      <BroadcastList title={translate('Broadcasts')} initialPageSize={5} />
    </>
  );
};
