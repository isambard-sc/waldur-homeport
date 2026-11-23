import { useQuery } from '@tanstack/react-query';

import { STALE_TIME } from '@/core/constants';

import { getUsageStats } from './usageStatsApi';

export const useUsageStats = (days: number) => {
  const queryResult = useQuery({
    queryKey: ['AIReportingUsageStats', days],
    queryFn: () => getUsageStats(days),
    staleTime: STALE_TIME,
  });

  return {
    isLoading: queryResult.isLoading,
    error: queryResult.error,
    refetch: queryResult.refetch,
    data: queryResult.data,
  };
};
