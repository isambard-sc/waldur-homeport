import { render, screen } from '@testing-library/react';
import { useRouter } from '@uirouter/react';
import { describe, expect, it, vi, beforeEach } from 'vitest';

import { isFeatureVisible } from '@/features/connect';
import { userHasRole } from '@/permissions/hasPermission';
import { useUser } from '@/workspace/hooks';

import { ProposalRoleBasedTabs } from './ProposalRoleBasedTabs';

vi.mock('@/features/connect', () => ({ isFeatureVisible: vi.fn() }));
vi.mock('@/permissions/hasPermission', () => ({ userHasRole: vi.fn() }));

// Params are captured rather than read off a serialized attribute, so an
// `undefined` value (the regression under test) stays distinguishable from a
// key that was never set.
let capturedLinks: Record<string, any>;
vi.mock('@/core/Link', () => ({
  Link: ({ state, params }: any) => {
    capturedLinks[state] = params;
    return <span data-testid={`link-${state}`} />;
  },
}));

vi.mock('waldur-ui', async () => {
  const actual = await vi.importActual<any>('waldur-ui');
  return {
    ...actual,
    TabNav: ({ items }: any) => (
      <>
        {items.map((item: any) => (
          <div key={item.key}>{item.link}</div>
        ))}
      </>
    ),
  };
});

const proposal = { uuid: 'proposal-uuid' } as any;

describe('ProposalRoleBasedTabs', () => {
  beforeEach(() => {
    vi.clearAllMocks();
    capturedLinks = {};
    vi.mocked(useUser).mockReturnValue({ uuid: 'user-uuid' } as any);
    vi.mocked(isFeatureVisible).mockReturnValue(true);
    vi.mocked(userHasRole).mockReturnValue(true);
    vi.mocked(useRouter).mockReturnValue({
      globals: {
        current: { name: 'call-management.proposal-details', parent: null },
      },
    } as any);
  });

  // Regression: the Bootstrap->Radix tab migration turned the Call manager
  // tab's link params from an on-click computation (by which point the
  // `call` query had always resolved) into one evaluated on every render.
  // ProposalManagePage does not gate rendering on that query, so `call` is
  // legitimately undefined on first paint - this must not throw.
  it('does not crash when the call query has not resolved yet', () => {
    expect(() =>
      render(
        <ProposalRoleBasedTabs
          proposal={proposal}
          review={null}
          call={undefined as any}
        />,
      ),
    ).not.toThrow();

    expect(
      screen.getByTestId('link-call-management.proposal-details'),
    ).toBeInTheDocument();
    expect(
      capturedLinks['call-management.proposal-details'].uuid,
    ).toBeUndefined();
  });

  it('threads the call customer uuid through once the call has loaded', () => {
    render(
      <ProposalRoleBasedTabs
        proposal={proposal}
        review={null}
        call={
          {
            uuid: 'call-uuid',
            customer_uuid: 'customer-uuid',
            manager_uuid: 'manager-uuid',
          } as any
        }
      />,
    );

    expect(capturedLinks['call-management.proposal-details'].uuid).toBe(
      'customer-uuid',
    );
  });
});
