import { useMemo } from 'react';
import { Table } from 'react-bootstrap';
import { useAsync } from 'react-use';

import { get } from '@waldur/core/api';
import { LoadingSpinner } from '@waldur/core/LoadingSpinner';
import { translate } from '@waldur/i18n';
import { OpenStackTenant } from '@waldur/openstack/openstack-tenant/types';

import { GroupSection } from '../GroupSection';

import { FlavorsSection } from './FlavorsSection';
import { FloatingIPsSection } from './FloatingIPsSection';
import { InstancesSection } from './InstancesSection';
import { NetworksSection } from './NetworksSection';
import { PortsSection } from './PortsSection';
import { RoutersSection } from './RoutersSection';
import { SecurityGroupsSection } from './SecurityGroupsSection';
import { ServerGroupsSection } from './ServerGroupsSection';
import { SnapshotsSection } from './SnapshotsSection';
import { SubnetsSection } from './SubnetsSection';
import { VolumesSection } from './VolumesSection';

interface TenantCounters {
  instances: number;
  server_groups: number;
  security_groups: number;
  flavors: number;
  images: number;
  volumes: number;
  snapshots: number;
  networks: number;
  floating_ips: number;
  ports: number;
  routers: number;
  subnets: number;
}

export const TenantDetails = ({ resource }) => {
  const { loading, error, value } = useAsync(async () => {
    const tenant = (await get<OpenStackTenant>(resource.scope)).data;
    const counters = (await get<TenantCounters>(resource.scope + 'counters/'))
      .data;
    return { tenant, counters };
  });
  const tabs = useMemo(
    () =>
      resource && value
        ? [
            {
              title: translate('Dashboard'),
              to: 'marketplace-project-resource-details',
              params: {
                resource_uuid: resource.uuid,
              },
            },
            {
              title: translate('Compute'),
              children: [
                {
                  title: translate('Instances ({count})', {
                    count: value.counters.instances,
                  }),
                  to: 'marketplace-project-resource-details',
                  params: {
                    tab: 'openstack-tenant-instances',
                  },
                  component: InstancesSection,
                },
                {
                  title: translate('Flavors ({count})', {
                    count: value.counters.flavors,
                  }),
                  to: 'marketplace-project-resource-details',
                  params: {
                    tab: 'openstack-tenant-flavors',
                  },
                  component: FlavorsSection,
                },
                {
                  title: translate('Server groups ({count})', {
                    count: value.counters.server_groups,
                  }),
                  to: 'marketplace-project-resource-details',
                  params: {
                    tab: 'openstack-tenant-server-groups',
                  },
                  component: ServerGroupsSection,
                },
              ],
            },
            {
              title: translate('Networking'),
              children: [
                {
                  title: translate('Routers ({count})', {
                    count: value.counters.routers,
                  }),
                  to: 'marketplace-project-resource-details',
                  params: {
                    tab: 'openstack-tenant-routers',
                  },
                  component: RoutersSection,
                },
                {
                  title: translate('Networks ({count})', {
                    count: value.counters.networks,
                  }),
                  to: 'marketplace-project-resource-details',
                  params: {
                    tab: 'openstack-tenant-networks',
                  },
                  component: NetworksSection,
                },
                {
                  title: translate('Subnets ({count})', {
                    count: value.counters.subnets,
                  }),
                  to: 'marketplace-project-resource-details',
                  params: {
                    tab: 'openstack-tenant-subnets',
                  },
                  component: SubnetsSection,
                },
                {
                  title: translate('Security groups ({count})', {
                    count: value.counters.security_groups,
                  }),
                  to: 'marketplace-project-resource-details',
                  params: {
                    tab: 'openstack-tenant-security-groups',
                  },
                  component: SecurityGroupsSection,
                },
                {
                  title: translate('Floating IPs ({count})', {
                    count: value.counters.floating_ips,
                  }),
                  to: 'marketplace-project-resource-details',
                  params: {
                    tab: 'openstack-tenant-floating-ips',
                  },
                  component: FloatingIPsSection,
                },
                {
                  title: translate('Ports ({count})', {
                    count: value.counters.ports,
                  }),
                  to: 'marketplace-project-resource-details',
                  params: {
                    tab: 'openstack-tenant-ports',
                  },
                  component: PortsSection,
                },
              ],
            },
            {
              title: translate('Storage'),
              children: [
                {
                  title: translate('Volumes ({count})', {
                    count: value.counters.volumes,
                  }),
                  to: 'marketplace-project-resource-details',
                  params: {
                    tab: 'openstack-tenant-volumes',
                  },
                  component: VolumesSection,
                },
                {
                  title: translate('Snapshots ({count})', {
                    count: value.counters.snapshots,
                  }),
                  to: 'marketplace-project-resource-details',
                  params: {
                    tab: 'openstack-tenant-snapshots',
                  },
                  component: SnapshotsSection,
                },
              ],
            },
          ]
        : [],
    [resource, value],
  );

  if (loading) return <LoadingSpinner />;

  if (error) return <>{translate('Unable to load resource details.')}</>;

  return (
    <Table>
      <thead>
        <tr>
          <th style={{ width: 10 }}>{/* Icon column */}</th>
          <th>{translate('Component')}</th>
          <th>{translate('State')}</th>
          <th>{translate('Summary')}</th>
          <th>{translate('Details')}</th>
        </tr>
      </thead>
      {tabs
        .filter((tab) => !!tab.children)
        .map((tab, tabIndex) => (
          <GroupSection
            key={tabIndex}
            title={tab.title}
            summary={tab.children.map((child) => child.title).join(', ')}
          >
            {tab.children.map((section, sectionIndex) => (
              <section.component
                key={sectionIndex}
                resource={value.tenant}
                title={section.title}
              />
            ))}
          </GroupSection>
        ))}
    </Table>
  );
};
