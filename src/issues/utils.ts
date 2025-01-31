import { DateTime } from 'luxon';
import { useMemo } from 'react';

import { getUUID } from '@waldur/core/utils';
import { PeriodOption } from '@waldur/form/types';
import { usePresetBreadcrumbItems } from '@waldur/navigation/header/breadcrumb/utils';
import { IBreadcrumbItem } from '@waldur/navigation/types';

import { Issue } from './list/types';

export const getStartAndEndDatesOfMonth = (period: PeriodOption) => {
  const { year, month } = period;
  const dt = DateTime.fromObject({ year, month });
  return {
    start: dt.startOf('month').toISODate(),
    end: dt.endOf('month').toISODate(),
  };
};

export const useIssueBreadcrumbItems = (issue: Issue): IBreadcrumbItem[] => {
  const isOrg =
    issue && issue.customer_uuid && !issue.project_uuid && !issue.resource;
  const isProject =
    issue && issue.customer_uuid && issue.project_uuid && !issue.resource;
  const isResource =
    issue && issue.customer_uuid && issue.project_uuid && issue.resource;
  const isUser =
    issue && !issue.customer_uuid && !issue.project_uuid && !issue.resource;

  const { getOrganizationBreadcrumbItem, getProjectBreadcrumbItem } =
    usePresetBreadcrumbItems();

  return useMemo(
    () =>
      [
        issue?.customer_uuid &&
          getOrganizationBreadcrumbItem(
            { uuid: issue.customer_uuid, name: issue.customer_name },
            { maxLength: 20, ellipsis: isOrg ? undefined : 'xl' },
          ),
        issue?.project_uuid &&
          getProjectBreadcrumbItem(
            {
              uuid: issue.project_uuid,
              name: issue.project_name,
              customer_uuid: issue.customer_uuid,
              customer_name: issue.customer_name,
            },
            { maxLength: 20, ellipsis: isProject ? undefined : 'xl' },
          ),
        issue?.resource && {
          key: 'resource',
          text: issue.resource_name,
          to: 'marketplace-resource-details',
          params: { resource_uuid: getUUID(issue.resource) },
          maxLength: 20,
          ellipsis: isResource ? undefined : 'xl',
        },
        isUser && {
          key: 'user',
          text: issue?.caller_full_name || '...',
          to: 'admin-user-user-manage',
          params: { user_uuid: issue?.caller_uuid },
          maxLength: 30,
          ellipsis: 'md',
        },
        {
          key: 'issue',
          text: issue
            ? issue.key
              ? `${issue.key}: ${issue.summary}`
              : issue.summary
            : '...',
          truncate: true,
          active: true,
        },
      ].filter(Boolean) as IBreadcrumbItem[],
    [issue],
  );
};

export const linkify = (s) =>
  s.replace(
    /\[(.+?)\|(.+)\]/g,
    (_, name, href) => `<a href="${href}">${name}</a>`,
  );
