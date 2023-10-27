import { RootState } from '@waldur/store/reducers';

import { isOwnerOrStaff } from './selectors';

describe('isOwnerOrStaff selector', () => {
  const staff = {
    is_staff: true,
    is_support: false,
    url: 'staff_url',
    uuid: 'staff_uuid',
  };

  const owner = {
    is_staff: false,
    is_support: false,
    url: 'owner_url',
    uuid: 'owner_uuid',
  };

  it('returns true if user is staff', () => {
    const workspace = { user: staff };
    const actual = isOwnerOrStaff({ workspace } as RootState);
    expect(actual).toBe(true);
  });

  it('returns true if user is organization owner', () => {
    const workspace = {
      user: owner,
      customer: {
        name: 'Alice',
        url: 'url',
        uuid: 'uuid',
        owners: [owner],
      },
    };
    const actual = isOwnerOrStaff({ workspace } as RootState);
    expect(actual).toBe(true);
  });

  it('returns false if user is not staff and is not organization owner', () => {
    const workspace = {
      user: owner,
      customer: {
        name: 'Alice',
        url: 'url',
        uuid: 'uuid',
        owners: [staff],
      },
    };
    const actual = isOwnerOrStaff({ workspace } as RootState);
    expect(actual).toBe(false);
  });
});
