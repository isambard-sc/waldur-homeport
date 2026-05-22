import { useQuery } from '@tanstack/react-query';

import { isFeatureVisible } from '@waldur/features/connect';
import { ProjectFeatures } from '@waldur/FeaturesEnums';
import { get } from '@waldur/openportal/api';
import type { AwardDetails } from '@waldur/openportal/bindings/AwardDetails';

interface EmailPolicy {
  allowed_domains: AwardDetails['allowed_domains'];
}

export const useProjectEmailPolicy = (projectUuid: string | undefined) =>
  useQuery<EmailPolicy>({
    queryKey: ['project-email-policy', projectUuid],
    queryFn: () => get<EmailPolicy>(`/openportal/project_email_policy/${projectUuid}/`),
    enabled: Boolean(projectUuid) && isFeatureVisible(ProjectFeatures.enforce_allowed_domains),
    staleTime: 5 * 60 * 1000,
  });
