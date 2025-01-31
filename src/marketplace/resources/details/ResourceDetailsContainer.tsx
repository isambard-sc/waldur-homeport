import { useQuery } from '@tanstack/react-query';
import { UIView, useCurrentStateAndParams } from '@uirouter/react';
import { FunctionComponent, useCallback, useEffect, useMemo } from 'react';
import { useDispatch } from 'react-redux';

import { usePermissionView } from '@waldur/auth/PermissionLayout';
import { lazyComponent } from '@waldur/core/lazyComponent';
import { translate } from '@waldur/i18n';
import { openModalDialog } from '@waldur/modal/actions';
import {
  useBreadcrumbs,
  usePageHero,
  useToolbarActions,
} from '@waldur/navigation/context';
import { usePresetBreadcrumbItems } from '@waldur/navigation/header/breadcrumb/utils';
import { useTitle } from '@waldur/navigation/title';
import { IBreadcrumbItem } from '@waldur/navigation/types';
import { usePageTabsTransmitter } from '@waldur/navigation/usePageTabsTransmitter';
import { ProjectUsersBadge } from '@waldur/project/ProjectUsersBadge';
import { setCurrentResource } from '@waldur/workspace/actions';

import { fetchData, getResourceTabs } from './fetchData';
import { ResourceBreadcrumbPopover } from './ResourceBreadcrumbPopover';
import { ResourceDetailsHero } from './ResourceDetailsHero';

const ProjectUsersList = lazyComponent(() =>
  import('@waldur/project/team/ProjectUsersList').then((module) => ({
    default: module.ProjectUsersList,
  })),
);

export const ResourceDetailsContainer: FunctionComponent<{}> = () => {
  const { params } = useCurrentStateAndParams();
  const dispatch = useDispatch();

  const { data, refetch, isLoading, isRefetching, error } = useQuery(
    ['resource-details-page', params['resource_uuid']],
    () => fetchData(params.resource_uuid),
    {
      refetchOnWindowFocus: false,
      staleTime: 3 * 60 * 1000,
    },
  );

  const tabs = useMemo(() => (data ? getResourceTabs(data) : []), [data]);

  useTitle(data?.resource.name);

  const { getOrganizationBreadcrumbItem, getProjectBreadcrumbItem } =
    usePresetBreadcrumbItems();

  const breadcrumbItems = useMemo<IBreadcrumbItem[]>(() => {
    if (!data?.resource) return [];
    return [
      {
        key: 'organizations',
        text: translate('Organizations'),
        to: 'organizations',
      },
      getOrganizationBreadcrumbItem({
        uuid: data.resource.customer_uuid,
        name: data.resource.customer_name,
      }),
      {
        key: 'organization.projects',
        text: translate('Projects'),
        to: 'organization.projects',
        params: { uuid: data.resource.customer_uuid },
        ellipsis: 'md',
      },
      getProjectBreadcrumbItem({
        uuid: data.resource.project_uuid,
        name: data.resource.project_name,
        customer_uuid: data.resource.customer_uuid,
        customer_name: data.resource.customer_name,
      }),
      {
        key: 'project.resources',
        text: data.resource.category_title,
        to: 'project.resources',
        params: { uuid: data.resource.project_uuid },
        ellipsis: 'xxl',
      },
      {
        key: 'resource',
        text: data.resource.name,
        dropdown: (close) => (
          <ResourceBreadcrumbPopover resource={data.resource} close={close} />
        ),
        truncate: true,
        active: true,
      },
    ];
  }, [data?.resource]);

  useBreadcrumbs(breadcrumbItems);

  usePermissionView(() => {
    if (data?.resource) {
      switch (data.resource.state) {
        case 'Terminated':
          return {
            permission: 'limited',
            banner: {
              title: translate('Resource is TERMINATED'),
              message: '',
            },
          };
      }
    }
    return null;
  }, [data]);

  useEffect(() => {
    dispatch(setCurrentResource(data?.resource));
    return () => {
      dispatch(setCurrentResource(undefined));
    };
  }, [data?.resource, dispatch]);

  usePageHero(
    !data && isLoading ? null : (
      <ResourceDetailsHero
        resource={data.resource}
        scope={data.scope}
        offering={data.offering}
        components={data.components}
        refetch={refetch}
        isLoading={isRefetching}
      />
    ),
    [data, refetch, isRefetching],
  );

  const openTeamModal = useCallback(() => {
    dispatch(openModalDialog(ProjectUsersList, { size: 'xl' }));
  }, []);

  useToolbarActions(
    <ProjectUsersBadge
      compact
      max={3}
      className="col-auto align-items-center me-10"
      onClick={openTeamModal}
    />,
    [openTeamModal],
  );

  const { tabSpec } = usePageTabsTransmitter(tabs);

  if (!data) return null;

  return (
    <UIView
      render={(Component, { key, ...props }) => (
        <Component
          key={key}
          {...props}
          refetch={refetch}
          data={{
            resource: data.resource,
            resourceScope: data.scope,
            offering: data.offering,
          }}
          isLoading={isLoading || isRefetching}
          error={error}
          tabSpec={tabSpec}
        />
      )}
    />
  );
};
