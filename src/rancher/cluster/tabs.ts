import { lazyComponent } from '@waldur/core/lazyComponent';
import { translate } from '@waldur/i18n';
import { ResourceTabsConfiguration } from '@waldur/resource/tabs/types';

export const RancherClusterTabConfiguration: ResourceTabsConfiguration = {
  type: 'Rancher.Cluster',
  tabs: [
    {
      title: translate('Cluster'),
      key: 'cluster',
      children: [
        {
          key: 'nodes',
          title: translate('Nodes'),
          component: lazyComponent(() =>
            import('../node/ClusterNodesList').then((module) => ({
              default: module.ClusterNodesList,
            })),
          ),
        },
        {
          key: 'projects',
          title: translate('Projects'),
          component: lazyComponent(() =>
            import('../ClusterProjectList').then((module) => ({
              default: module.ClusterProjectList,
            })),
          ),
        },
        {
          key: 'users',
          title: translate('Users'),
          component: lazyComponent(() =>
            import('@waldur/rancher/cluster/users/ClusterUsersList').then(
              (module) => ({
                default: module.ClusterUsersList,
              }),
            ),
          ),
        },
      ],
    },
    {
      title: translate('Apps'),
      key: 'apps',
      children: [
        {
          key: 'templates',
          title: translate('Application templates'),
          component: lazyComponent(() =>
            import('../template/ClusterTemplateList').then((module) => ({
              default: module.ClusterTemplatesList,
            })),
          ),
        },
        {
          key: 'applications',
          title: translate('Applications'),
          component: lazyComponent(() =>
            import('./apps/ClusterApplicationsList').then((module) => ({
              default: module.ClusterApplicationsList,
            })),
          ),
        },
        {
          key: 'workloads',
          title: translate('Workloads'),
          component: lazyComponent(() =>
            import('./ClusterWorkloadsList').then((module) => ({
              default: module.ClusterWorkloadsList,
            })),
          ),
        },
        {
          key: 'catalogs',
          title: translate('Catalogues'),
          component: lazyComponent(() =>
            import('../catalog/ClusterCatalogList').then((module) => ({
              default: module.ClusterCatalogList,
            })),
          ),
        },
      ],
    },
    {
      title: translate('Service discovery'),
      key: 'service-discovery',
      children: [
        {
          key: 'hpas',
          title: translate('HPA'),
          component: lazyComponent(() =>
            import('./hpas/ClusterHPAList').then((module) => ({
              default: module.ClusterHPAList,
            })),
          ),
        },
        {
          key: 'ingresses',
          title: translate('Ingress'),
          component: lazyComponent(() =>
            import('./ClusterIngressesList').then((module) => ({
              default: module.ClusterIngressesList,
            })),
          ),
        },
        {
          key: 'services',
          title: translate('Services'),
          component: lazyComponent(() =>
            import('./ClusterServicesList').then((module) => ({
              default: module.ClusterServicesList,
            })),
          ),
        },
      ],
    },
  ],
};
