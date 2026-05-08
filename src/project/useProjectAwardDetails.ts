import { useQuery } from '@tanstack/react-query';
import { openportalManagedProjectsList } from 'waldur-js-client';

import type { AwardDetails } from '@waldur/openportal/bindings/AwardDetails';

export const useProjectAwardDetails = (projectUuid: string | undefined) =>
  useQuery({
    queryKey: ['project-managed', projectUuid],
    queryFn: async () => {
      const { data } = await openportalManagedProjectsList({
        query: {
          project_uuid: projectUuid,
          state: ['approved', 'pending', 'rejected'],
          page_size: 1,
        },
      });
      if (!Array.isArray(data) || data.length === 0) return null;
      return data[0].details as AwardDetails;
    },
    staleTime: 5 * 60 * 1000,
    enabled: Boolean(projectUuid),
  });
