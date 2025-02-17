import { describe, it, expect, vi } from 'vitest';

import { Port } from '@waldur/resource/types';
import { renderTable } from '@waldur/table/testUtils';

import { InternalIpsList } from './InternalIpsList';

vi.mock('@waldur/table/useTableLoader', () => ({
  useTableLoader: () => false,
}));

const renderList = () => {
  const item: Port = {
    fixed_ips: [{ ip_address: '192.168.42.14', subnet_id: '' }],
    mac_address: 'fa:16:3e:93:f0:7d',
    subnet: 'api/openstack-subnets/7350f289a6d14e4bbd780ee59b2899e6/',
    subnet_uuid: '7350f289a6d14e4bbd780ee59b2899e6',
    subnet_name: 'theses-and-papers-on-mach-sub-net',
    subnet_description: '',
    subnet_cidr: '192.168.42.0/24',
    allowed_address_pairs: [],
  };
  return renderTable(InternalIpsList, 'openstack-internal-ips', '0', item);
};

describe('InternalIpsList', () => {
  it('renders list', () => {
    const wrapper = renderList();
    expect(wrapper.container).toMatchSnapshot();
  });
});
