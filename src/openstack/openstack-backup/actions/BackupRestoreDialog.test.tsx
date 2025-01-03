import { render, screen, waitFor, within } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { beforeEach, describe, expect, it, vi } from 'vitest';

import { useModal } from '@waldur/modal/hooks';
import * as api from '@waldur/openstack/api';
import { Flavor, Subnet } from '@waldur/openstack/openstack-instance/types';
import { useNotify } from '@waldur/store/hooks';

import { OpenStackBackup } from '../types';

import { BackupRestoreDialog } from './BackupRestoreDialog';

const fakeSubnet = {
  url: '/api/openstack-subnets/51e584157094493ca121f71642c0a409/',
  name: 'p60347-sub-net',
  cidr: '192.168.42.0/24',
} as unknown as Subnet;

const freeSubnet = {
  url: '/api/openstack-subnets/62f584157094493ca121f71642c0a410/',
  name: 'free-subnet',
  cidr: '192.168.43.0/24',
} as unknown as Subnet;

const fakeBackup = {
  url: '/api/openstack-backups/21693289bd78400db79fb2a0ef2ba177/',
  uuid: '21693289bd78400db79fb2a0ef2ba177',
  name: 'After 9th lab',
  tenant_uuid: '43c3b302130c414faa138c14d0e69017',
  resource_type: 'OpenStack.Backup',
  instance: '/api/openstack-instances/6f271860e0764d8cb79573226b726b53/',
  instance_name: 'empowerseamlessinfrastructures',
  instance_security_groups: [
    {
      url: '/api/openstack-security-groups/fce1fed2b8dd40b8b98252c4df76007f/',
      name: 'traefik',
    },
    {
      url: '/api/openstack-security-groups/5bf390b13f194a1fa3fd397631eaac19/',
      name: 'IMAPS',
    },
  ],
  instance_ports: [
    {
      subnet: fakeSubnet.url,
      subnet_name: fakeSubnet.name,
      subnet_cidr: fakeSubnet.cidr,
    },
  ],
} as unknown as OpenStackBackup;

const fakeFlavors = [
  {
    url: '/api/openstack-flavors/7e9a8c7f17f34706bf755abdae41fe3a/',
    uuid: '7e9a8c7f17f34706bf755abdae41fe3a',
    name: 'm1.xsmall',
    settings: '/api/service-settings/a926568f29df442e8eb447459d3121a1/',
    cores: 1,
    ram: 1024,
    disk: 10240,
  },
  {
    url: '/api/openstack-flavors/7a8c733bd6bf4560ae8b2d08129e1840/',
    uuid: '7a8c733bd6bf4560ae8b2d08129e1840',
    name: 'm1.small',
    settings: '/api/service-settings/a926568f29df442e8eb447459d3121a1/',
    cores: 1,
    ram: 2048,
    disk: 20480,
  },
] as unknown as Flavor[];

vi.mock('@waldur/openstack/api');
vi.mock('@waldur/modal/hooks');

vi.mock('@waldur/store/hooks', () => ({
  useNotify: vi.fn().mockReturnValue({
    showSuccess: vi.fn(),
    showErrorResponse: vi.fn(),
  }),
  useTheme: () => 'light',
}));

const apiMock = vi.mocked(api);

const renderDialog = async () => {
  const result = render(
    <BackupRestoreDialog resolve={{ resource: fakeBackup }} />,
  );
  await waitFor(() =>
    expect(screen.queryByTestId('spinner')).not.toBeInTheDocument(),
  );
  return result;
};

describe('BackupRestoreDialog', () => {
  let mockShowSuccess;
  let mockShowErrorResponse;

  beforeEach(() => {
    mockShowSuccess = vi.fn();
    mockShowErrorResponse = vi.fn();
    vi.mocked(useNotify).mockReturnValue({
      showError: vi.fn(),
      showSuccess: mockShowSuccess,
      showErrorResponse: mockShowErrorResponse,
    });
    vi.mocked(useModal).mockReturnValue({
      closeDialog: vi.fn(),
    } as any);

    apiMock.loadFlavors.mockResolvedValue([]);
    apiMock.loadSecurityGroups.mockResolvedValue([]);
    apiMock.loadFloatingIps.mockResolvedValue([]);
    apiMock.loadSubnets.mockResolvedValue([]);
  });

  it('renders current instance name in modal dialog title', async () => {
    await renderDialog();
    expect(
      screen.getByText(/Restore virtual machine from backup After 9th lab/),
    ).toBeInTheDocument();
  });

  it('shows loading state while data is being fetched', () => {
    render(<BackupRestoreDialog resolve={{ resource: fakeBackup }} />);
    expect(screen.getByTestId('spinner')).toBeInTheDocument();
  });

  it('disables submit button while data is loading', () => {
    render(<BackupRestoreDialog resolve={{ resource: fakeBackup }} />);
    expect(
      screen.getByRole('button', {
        name: /submit/i,
      }),
    ).toBeDisabled();
  });

  it('filters related resources by tenant', async () => {
    await renderDialog();
    expect(apiMock.loadFlavors).toHaveBeenCalledWith({
      tenant_uuid: fakeBackup.tenant_uuid,
      fields: ['url', 'name', 'cores', 'ram'],
    });
    expect(apiMock.loadSecurityGroups).toHaveBeenCalledWith({
      tenant_uuid: fakeBackup.tenant_uuid,
      fields: ['url', 'name'],
    });
    expect(apiMock.loadFloatingIps).toHaveBeenCalledWith({
      tenant_uuid: fakeBackup.tenant_uuid,
      free: 'True',
      fields: ['url', 'address'],
    });
    expect(apiMock.loadSubnets).toHaveBeenCalledWith({
      tenant_uuid: fakeBackup.tenant_uuid,
      fields: ['url', 'name', 'cidr'],
    });
  });

  it('renders security groups correctly', async () => {
    apiMock.loadSecurityGroups.mockResolvedValue(
      fakeBackup.instance_security_groups as any,
    );
    await renderDialog();

    const securityGroupsSelect = screen.getByLabelText('Security groups');
    expect(securityGroupsSelect).toBeInTheDocument();

    // Open the select dropdown
    await userEvent.click(securityGroupsSelect);

    // Check that all security groups are present in the dropdown
    fakeBackup.instance_security_groups.forEach((group) => {
      expect(
        screen.getByText(group.name, { selector: 'span.badge' }),
      ).toBeInTheDocument();
    });
  });

  it('renders networks section correctly', async () => {
    apiMock.loadSubnets.mockResolvedValue([fakeSubnet]);
    const { container } = await renderDialog();

    expect(screen.getByText(/Networks/i)).toBeInTheDocument();
    const networkRows = container.querySelectorAll('tbody tr');
    expect(networkRows).toHaveLength(fakeBackup.instance_ports.length);
  });

  it('disabled add network button when subnets are not available', async () => {
    apiMock.loadSubnets.mockResolvedValue([fakeSubnet]);
    await renderDialog();

    const addButton = screen.getByRole('button', { name: /Add/i });
    expect(addButton).not.toBeEnabled();
  });

  it('enables add network button when subnets are available', async () => {
    apiMock.loadSubnets.mockResolvedValue([fakeSubnet, freeSubnet]);
    await renderDialog();

    const addButton = screen.getByRole('button', { name: /Add/i });
    expect(addButton).toBeEnabled();
  });

  it('allows adding and removing network rows', async () => {
    apiMock.loadSubnets.mockResolvedValue([fakeSubnet, freeSubnet]);
    const { container } = await renderDialog();

    const addButton = screen.getByRole('button', { name: /Add/i });
    await userEvent.click(addButton);

    let networkRows = container.querySelectorAll('tbody tr');
    expect(networkRows).toHaveLength(fakeBackup.instance_ports.length + 1);

    const deleteButton = screen.getAllByRole('button', { name: /Delete/i })[0];
    await userEvent.click(deleteButton);

    networkRows = container.querySelectorAll('tbody tr');
    expect(networkRows).toHaveLength(fakeBackup.instance_ports.length);
  });

  it('shows success notification with correct message on successful submit', async () => {
    apiMock.loadFlavors.mockResolvedValue(fakeFlavors);
    apiMock.restoreBackup.mockResolvedValue(null);
    await renderDialog();

    // Select flavor and submit
    await userEvent.click(screen.getByLabelText('Flavor'));
    await userEvent.click(screen.getByText(/m1.xsmall/i));
    await userEvent.click(screen.getByRole('button', { name: /Submit/i }));

    expect(mockShowSuccess).toHaveBeenCalledWith(
      'VM snapshot restoration has been scheduled.',
    );
  });

  it('shows error notification with correct message on failed submit', async () => {
    const error = new Error('API Error');
    apiMock.loadFlavors.mockResolvedValue(fakeFlavors);
    apiMock.restoreBackup.mockRejectedValue(error);
    await renderDialog();

    // Select flavor and submit
    await userEvent.click(screen.getByLabelText('Flavor'));
    await userEvent.click(screen.getByText(/m1.xsmall/i));
    await userEvent.click(screen.getByRole('button', { name: /Submit/i }));

    expect(mockShowErrorResponse).toHaveBeenCalledWith(
      error,
      'Unable to restore VM snapshot.',
    );
  });

  it('submits form with correct data', async () => {
    apiMock.loadFlavors.mockResolvedValue(fakeFlavors);
    apiMock.restoreBackup.mockResolvedValue(null);
    await renderDialog();

    // Select flavor
    const flavorSelect = screen.getByLabelText('Flavor');
    await userEvent.click(flavorSelect);
    await userEvent.click(screen.getByText(/m1.xsmall/i));

    // Submit form
    const submitButton = screen.getByRole('button', { name: /Submit/i });
    await userEvent.click(submitButton);

    expect(apiMock.restoreBackup).toHaveBeenCalledWith(fakeBackup.uuid, {
      flavor: fakeFlavors[0].url,
      floating_ips: [],
      ports: [
        {
          subnet: fakeSubnet.url,
        },
      ],
      security_groups: fakeBackup.instance_security_groups.map((group) => ({
        url: group.url,
      })),
    });
  });

  it('handles floating IP selection correctly', async () => {
    const floatingIps = [
      { address: '1.1.1.1', url: 'url1' },
      { address: '2.2.2.2', url: 'url2' },
    ];

    apiMock.loadFloatingIps.mockResolvedValue(floatingIps as any);
    apiMock.loadSubnets.mockResolvedValue([fakeSubnet]);

    const { container } = await renderDialog();

    const floatingIpSelect = container.querySelector(
      '[name="networks[0].floating_ip"]',
    );
    expect(floatingIpSelect).toBeInTheDocument();

    const options = within(floatingIpSelect as HTMLElement).getAllByRole(
      'option',
    );
    expect(options).toHaveLength(4); // Skip, Auto-assign, and 2 IPs
    expect(options[2]).toHaveTextContent('1.1.1.1');
    expect(options[3]).toHaveTextContent('2.2.2.2');
  });

  it('submits form with floating IP when selected', async () => {
    apiMock.loadFlavors.mockResolvedValue(fakeFlavors);
    apiMock.loadFloatingIps.mockResolvedValue([
      { address: '1.1.1.1', url: 'floating_ip_url' },
    ] as any);
    apiMock.restoreBackup.mockResolvedValue(null);

    const { container } = await renderDialog();

    // Select flavor
    await userEvent.click(screen.getByLabelText('Flavor'));
    await userEvent.click(screen.getByText(/m1.xsmall/i));

    // Select floating IP
    const floatingIpSelect = container.querySelector(
      '[name="networks[0].floating_ip"]',
    );
    await userEvent.selectOptions(floatingIpSelect, 'floating_ip_url');

    // Submit form
    await userEvent.click(screen.getByRole('button', { name: /Submit/i }));

    expect(apiMock.restoreBackup).toHaveBeenCalledWith(
      fakeBackup.uuid,
      expect.objectContaining({
        floating_ips: [
          {
            subnet: fakeSubnet.url,
            url: 'floating_ip_url',
          },
        ],
      }),
    );
  });

  it('handles refetch callback after successful submit', async () => {
    const refetch = vi.fn();
    apiMock.loadFlavors.mockResolvedValue(fakeFlavors);
    apiMock.restoreBackup.mockResolvedValue(null);

    render(<BackupRestoreDialog resolve={{ resource: fakeBackup, refetch }} />);

    await waitFor(() =>
      expect(screen.queryByTestId('spinner')).not.toBeInTheDocument(),
    );

    // Select flavor and submit
    await userEvent.click(screen.getByLabelText('Flavor'));
    await userEvent.click(screen.getByText(/m1.xsmall/i));
    await userEvent.click(screen.getByRole('button', { name: /Submit/i }));

    expect(refetch).toHaveBeenCalled();
  });
});
