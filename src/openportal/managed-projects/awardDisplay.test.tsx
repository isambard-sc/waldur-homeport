import { describe, expect, it } from 'vitest';

import {
  allowedDomainsLabel,
  memberRoleLabel,
  offeringName,
} from './awardDisplay';

const template: any = {
  role_mapping_data: {
    PI: { name: 'PROJECT.MANAGER', description: 'Project manager' },
    member: { name: 'PROJECT.MEMBER', description: '' },
  },
};

describe('memberRoleLabel', () => {
  it('names the local role a member maps to', () => {
    expect(memberRoleLabel('PI', template)).toBe('Project manager');
  });

  it('matches the role case-insensitively', () => {
    expect(memberRoleLabel('pi', template)).toBe('Project manager');
  });

  it('falls back to the role name when it has no description', () => {
    expect(memberRoleLabel('member', template)).toBe('PROJECT.MEMBER');
  });

  it('says when a role has no mapping', () => {
    expect(memberRoleLabel('observer', template)).toBe(
      'observer has no mapping - will not be added to project',
    );
  });

  it('says when the template maps no roles at all', () => {
    expect(memberRoleLabel('PI', { role_mapping_data: {} })).toBe(
      'Will not be added to project',
    );
    expect(memberRoleLabel('PI', null)).toBe('Will not be added to project');
  });

  it('says when a member has no role', () => {
    expect(memberRoleLabel('', template)).toBe('No role assigned');
  });
});

describe('allowedDomainsLabel', () => {
  it('reads null as every domain allowed', () => {
    expect(allowedDomainsLabel(null)).toBe('All domains allowed');
  });

  it('reads an empty list as no domain allowed', () => {
    expect(allowedDomainsLabel([])).toBe('No domains allowed');
  });

  it('lists the allowed domains', () => {
    expect(allowedDomainsLabel(['bristol.ac.uk', 'ucl.ac.uk'])).toBe(
      'bristol.ac.uk, ucl.ac.uk',
    );
  });
});

describe('offeringName', () => {
  it('is the last part of the destination', () => {
    expect(offeringName('airr.brics.isambard-ai')).toBe('isambard-ai');
  });

  it('is null without a destination', () => {
    expect(offeringName('')).toBeNull();
  });
});
