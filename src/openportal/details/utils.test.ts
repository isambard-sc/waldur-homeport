import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest';

import * as marketplaceApi from '@waldur/marketplace/common/api';
import { ComponentUsage } from '@waldur/marketplace/resources/usage/types';
import * as openportalApi from '@waldur/openportal/details/api';

import componentUsages from './fixtures/component-usages.json';
import userUsages from './fixtures/user-usages.json';
import { loadCharts } from './utils';

vi.mock('@waldur/openportal/details/api');
vi.mock('@waldur/marketplace/common/api');

describe('OpenPortal allocation usage chart formatter', () => {
  beforeEach(() => {
    vi.useFakeTimers();
  });

  afterEach(() => {
    vi.useRealTimers();
  });

  beforeEach(() => {
    vi.setSystemTime(new Date(2020, 6, 1));
    vi.mocked(openportalApi).getAllocationUserUsages.mockResolvedValue(userUsages);
    vi.mocked(marketplaceApi).getComponentUsages.mockResolvedValue(
      componentUsages as ComponentUsage[],
    );
  });

  it('parses data and returns eChart option correctly', async () => {
    const charts = await loadCharts('allocationUrl', 'resourceUuid');
    expect(charts).toMatchSnapshot();
  });
});
