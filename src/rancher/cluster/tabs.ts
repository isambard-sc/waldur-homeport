import { lazyComponent } from '@waldur/core/lazyComponent';
import { translate } from '@waldur/i18n';
import { ResourceTabsConfiguration } from '@waldur/resource/tabs/types';

const ClusterUsersList = lazyComponent(() =>
  import('@waldur/rancher/cluster/users/ClusterUsersList').then((module) => ({
    default: module.ClusterUsersList,
  })),
);
const ClusterCatalogList = lazyComponent(() =>
  import('../catalog/ClusterCatalogList').then((module) => ({
    default: module.ClusterCatalogList,
  })),
);
const ClusterProjectList = lazyComponent(() =>
  import('../ClusterProjectList').then((module) => ({
    default: module.ClusterProjectList,
  })),
);
const ClusterNodesList = lazyComponent(() =>
  import('../node/ClusterNodesList').then((module) => ({
    default: module.ClusterNodesList,
  })),
);
const ClusterTemplatesList = lazyComponent(() =>
  import('../template/ClusterTemplateList').then((module) => ({
    default: module.ClusterTemplatesList,
  })),
);
const ClusterApplicationsList = lazyComponent(() =>
  import('./apps/ClusterApplicationsList').then((module) => ({
    default: module.ClusterApplicationsList,
  })),
);
const ClusterIngressesList = lazyComponent(() =>
  import('./ClusterIngressesList').then((module) => ({
    default: module.ClusterIngressesList,
  })),
);
const ClusterServicesList = lazyComponent(() =>
  import('./ClusterServicesList').then((module) => ({
    default: module.ClusterServicesList,
  })),
);
const ClusterWorkloadsList = lazyComponent(() =>
  import('./ClusterWorkloadsList').then((module) => ({
    default: module.ClusterWorkloadsList,
  })),
);
const ClusterHPAList = lazyComponent(() =>
  import('./hpas/ClusterHPAList').then((module) => ({
    default: module.ClusterHPAList,
  })),
);

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
          component: ClusterNodesList,
        },
        {
          key: 'projects',
          title: translate('Projects'),
          component: ClusterProjectList,
        },
        {
          key: 'users',
          title: translate('Users'),
          component: ClusterUsersList,
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
          component: ClusterTemplatesList,
        },
        {
          key: 'applications',
          title: translate('Applications'),
          component: ClusterApplicationsList,
        },
        {
          key: 'workloads',
          title: translate('Workloads'),
          component: ClusterWorkloadsList,
        },
        {
          key: 'catalogs',
          title: translate('Catalogues'),
          component: ClusterCatalogList,
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
          component: ClusterHPAList,
        },
        {
          key: 'ingresses',
          title: translate('Ingress'),
          component: ClusterIngressesList,
        },
        {
          key: 'services',
          title: translate('Services'),
          component: ClusterServicesList,
        },
      ],
    },
  ],
};
