import { render, screen } from '@testing-library/react';
import { describe, it, expect, vi } from 'vitest';

import { NodeRoleField } from './NodeRoleField';

vi.mock('@waldur/i18n', () => ({
  translate: (text: string) => text,
}));

describe('NodeRoleField', () => {
  it('renders "All" when all roles are true', () => {
    render(
      <NodeRoleField
        node={{ worker_role: true, etcd_role: true, controlplane_role: true }}
      />,
    );
    expect(screen.getByText('All')).toBeInTheDocument();
  });

  it('renders "worker" when only worker_role is true', () => {
    render(
      <NodeRoleField
        node={{ worker_role: true, etcd_role: false, controlplane_role: false }}
      />,
    );
    expect(screen.getByText('worker')).toBeInTheDocument();
  });

  it('renders "etcd" when only etcd_role is true', () => {
    render(
      <NodeRoleField
        node={{ worker_role: false, etcd_role: true, controlplane_role: false }}
      />,
    );
    expect(screen.getByText('etcd')).toBeInTheDocument();
  });

  it('renders "control plane" when only controlplane_role is true', () => {
    render(
      <NodeRoleField
        node={{ worker_role: false, etcd_role: false, controlplane_role: true }}
      />,
    );
    expect(screen.getByText('control plane')).toBeInTheDocument();
  });

  it('renders "worker, etcd" when worker_role and etcd_role are true', () => {
    render(
      <NodeRoleField
        node={{ worker_role: true, etcd_role: true, controlplane_role: false }}
      />,
    );
    expect(screen.getByText('worker, etcd')).toBeInTheDocument();
  });

  it('renders "worker, control plane" when worker_role and controlplane_role are true', () => {
    render(
      <NodeRoleField
        node={{ worker_role: true, etcd_role: false, controlplane_role: true }}
      />,
    );
    expect(screen.getByText('worker, control plane')).toBeInTheDocument();
  });

  it('renders "etcd, control plane" when etcd_role and controlplane_role are true', () => {
    render(
      <NodeRoleField
        node={{ worker_role: false, etcd_role: true, controlplane_role: true }}
      />,
    );
    expect(screen.getByText('etcd, control plane')).toBeInTheDocument();
  });

  it('renders an empty string when no roles are true', () => {
    render(
      <NodeRoleField
        node={{
          worker_role: false,
          etcd_role: false,
          controlplane_role: false,
        }}
      />,
    );
    expect(
      screen.queryByText(/worker|etcd|control plane/),
    ).not.toBeInTheDocument();
  });
});
