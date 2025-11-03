import { ShoppingCartIcon } from '@phosphor-icons/react';
import { useCurrentStateAndParams, useRouter } from '@uirouter/react';
import { useEffect } from 'react';

import { translate } from '@waldur/i18n';
import { MenuComponent } from '@waldur/metronic/components';
import { CallPublicMenu } from '@waldur/navigation/sidebar/CallPublicMenu';
import { useUser } from '@waldur/workspace/hooks';
import { useThemeFeatures } from '@waldur/theme/useThemeFeatures';

import { MarketplaceTrigger } from './marketplace-popup/MarketplaceTrigger';
import { MenuItem } from './MenuItem';
import { OrganizationsListMenu } from './OrganizationsListMenu';
import { ProjectsListMenu } from './ProjectsListMenu';
import { ReportingMenu } from './ReportingMenu';
import { ResourcesMenu } from './ResourcesMenu';
import { Sidebar } from './Sidebar';

export const UnifiedSidebar = () => {
  const user = useUser();
  const router = useRouter();
  const { state, params } = useCurrentStateAndParams();
  const themeFeatures = useThemeFeatures();

  const hasOrganizations =
    user?.is_staff ||
    user?.is_support ||
    user?.permissions?.some((permission) => permission.scope_type === 'customer');
  const hasProjects =
    user?.is_staff ||
    user?.is_support ||
    user?.permissions?.some((permission) => permission.scope_type === 'project');
  const hasResources =
    user?.is_staff ||
    user?.is_support ||
    user?.permissions?.some(
      (permission) =>
        permission.scope_type === 'customer' || permission.scope_type === 'project',
    );

  useEffect(() => {
    MenuComponent.reinitialization();
    const menuElement = document.querySelector('#kt_aside_menu');
    if (!menuElement) {
      return;
    }
    const menu = MenuComponent.getInstance(menuElement as HTMLElement);
    if (!menu) {
      return;
    }
    if (
      [
        'marketplace-project-resources-all',
        'marketplace-project-resources',
        'category-resources',
        'all-resources',
      ].includes(state.name) ||
      params.resource_uuid
    ) {
      const item = document.querySelector('#resources-menu');
      menu.show(item);
    }
    if (
      [
        'calls-for-proposals-dashboard',
        'proposals-all-proposals',
        'reviews-all-reviews',
        'public-call.details',
        'protected-call.main',
      ].includes(state.name)
    ) {
      const item = document.querySelector('#calls-menu');
      menu.show(item);
    }
  }, [router, state, params.resource_uuid]);

  if (!user) {
    return null;
  }
  return (
    <Sidebar>
      {themeFeatures.ShowMarketplaceTrigger && (user.is_staff || user.permissions?.length !== 0) ? (
        <MarketplaceTrigger />
      ) : null}
      {hasOrganizations ? <OrganizationsListMenu /> : null}
      {hasProjects ? <ProjectsListMenu /> : null}
      {hasResources ? <ResourcesMenu user={user} /> : null}
      <ReportingMenu />
      <CallPublicMenu />
      {themeFeatures.ShowSidebarMarketPlace ? (
        <MenuItem
          activeState={
            [
              'public.marketplace',
              'public-offering',
              'marketplace-orders.details',
            ].some((name) => state.name.startsWith(name))
              ? state.name
              : undefined
          }
          icon={<ShoppingCartIcon weight="bold" />}
          title={translate('Marketplace')}
          state="public.marketplace-landing"
          child={false}
        />
      ) : null}
    </Sidebar>
  );
};
